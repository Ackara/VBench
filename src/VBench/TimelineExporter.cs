using BenchmarkDotNet.Columns;
using BenchmarkDotNet.Exporters;
using BenchmarkDotNet.Helpers;
using BenchmarkDotNet.Horology;
using BenchmarkDotNet.Loggers;
using BenchmarkDotNet.Reports;
using LibGit2Sharp;
using LiteDB;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;

namespace Acklann.VBench
{
    /// <summary>
    /// An exporter that saves your results.
    /// </summary>
    /// <seealso cref="BenchmarkDotNet.Exporters.IExporter" />
    public class TimelineExporter : IExporter
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="TimelineExporter"/> class.
        /// </summary>
        public TimelineExporter() : this(false)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="TimelineExporter"/> class.
        /// </summary>
        /// <param name="captureGitEmail">if set to <c>true</c> [capture git email].</param>
        public TimelineExporter(bool captureGitEmail)
        {
            Name = $"{nameof(VBench)}";
            _fileName = $"{nameof(VBench).ToLowerInvariant()}";
            _templateName = Template.Timeline;

            _captureEmail = captureGitEmail;
            _unitsOfTime.Add("us", TimeUnit.Nanosecond); //For some reason TimeUnit don't have us registed as nanoseconds.
        }

        /// <summary>
        /// Gets the name.
        /// </summary>
        /// <value>The name.</value>
        public string Name { get; }

        /// <summary>
        /// Exports to log.
        /// </summary>
        /// <param name="summary">The summary.</param>
        /// <param name="logger">The logger.</param>
        public void ExportToLog(Summary summary, ILogger logger)
        {
        }

        /// <summary>
        /// Exports to files.
        /// </summary>
        /// <param name="summary">The summary.</param>
        /// <param name="consoleLogger">The console logger.</param>
        /// <returns></returns>
        public IEnumerable<string> ExportToFiles(Summary summary, ILogger consoleLogger)
        {
            string databaseFilePath = Path.Combine(summary.ResultsDirectoryPath, $"{_fileName}.litedb");
            CuratedDataset lastestBenchmark = UpdateDatabase(summary, databaseFilePath, _captureEmail);
            IEnumerable<CuratedDataset> mergedData = ExportDatabase(databaseFilePath);

            Assembly assembly = typeof(TimelineExporter).Assembly;
            string reportFilePath = Path.Combine(summary.ResultsDirectoryPath, $"{_fileName}.html");
            using (Stream output = new FileStream(reportFilePath, System.IO.FileMode.Create, FileAccess.Write, FileShare.Read))
            using (Stream source = assembly.GetManifestResourceStream(assembly.GetManifestResourceNames().First(x => x.EndsWith(_templateName))))
            {
                var html = new HtmlAgilityPack.HtmlDocument();
                html.Load(source);

                var script = html.GetElementbyId("data");
                script.RemoveAllChildren();
                script.AppendChild(html.CreateTextNode(JsonConvert.SerializeObject(mergedData, new JsonSerializerSettings()
                {
                    Formatting = Formatting.Indented,
                    ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()
                })));
                html.Save(output);
            }

            return new string[] { databaseFilePath, reportFilePath };
        }

        internal static CuratedDataset UpdateDatabase(Summary summary, string databaseFilePath, bool captureEmail)
        {
            if (summary == null) throw new ArgumentNullException(nameof(summary));
            if (string.IsNullOrEmpty(databaseFilePath)) throw new ArgumentNullException(nameof(databaseFilePath));

            using (var db = new LiteDatabase(databaseFilePath))
            {
                var store = db.GetCollection<CuratedDataset>(ResolveCollectionName(summary));

                var result = new CuratedDataset();
                result.Name = store.Name;

                var columns = new List<CuratedDatasetColumn>();
                foreach (var column in summary.Table.Columns.Where(x => x.NeedToShow || CuratedDatasetColumn.RequiredColumns.Contains(x.OriginalColumn.ColumnName)))
                {
                    columns.Add(new CuratedDatasetColumn
                    {
                        Index = column.Index,
                        Name = column.OriginalColumn.ColumnName,
                        UnitKind = column.OriginalColumn.UnitType,
                        IsNumeric = column.OriginalColumn.IsNumeric
                    });
                }
                result.Columns = columns.ToArray();
                result.Rows = summary.Table.FullContent;
                result.Contributions = new[] { FetchRepositoryInfo(summary, captureEmail) };

                store.Insert(result);
                return result;
            }
        }

        internal static IEnumerable<CuratedDataset> ExportDatabase(string databaseFilePath)
        {
            if (string.IsNullOrEmpty(databaseFilePath)) throw new ArgumentNullException(nameof(databaseFilePath));

            using (var db = new LiteDatabase(databaseFilePath))
            {
                foreach (string collectionName in db.GetCollectionNames())
                {
                    var store = db.GetCollection<CuratedDataset>(collectionName);
                    var item = ConsolidateCollection(store);
                    if (item?.Rows.Length > 0) yield return item;
                }
            }
        }

        internal static CuratedDataset ConsolidateCollection(LiteCollection<CuratedDataset> store)
        {
            if (store == null) throw new ArgumentNullException(nameof(store));

            object[] storedValues, curatedValues;
            var curatedColumns = new Stack<CuratedDatasetColumn>();
            var result = new CuratedDataset { Name = store.Name.Replace('_', '.') };
            int columnIndex;

            CuratedDataset[] allTheTests = store.FindAll().ToArray();
            if (allTheTests.Length > 0)
            {
                CuratedDataset mostRecentTest = allTheTests.Last();
                result.Rows = new object[mostRecentTest.Rows.Length][];
                curatedValues = new object[mostRecentTest.Columns.Length];
                result.Columns = mostRecentTest.Columns.Select(x => x.Clone()).ToArray();

                for (int rowIndex = 0; rowIndex < mostRecentTest.Rows.Length; rowIndex++)
                {
                    columnIndex = 0;
                    storedValues = mostRecentTest.Rows[rowIndex];
                    foreach (CuratedDatasetColumn column in mostRecentTest.Columns)
                    {
                        if (column.IsNumeric)
                            curatedValues[columnIndex++] = getHistoricalData(allTheTests, Convert.ToString(storedValues[method_column_index]), column.Name, allTheTests.Length);
                        else
                            curatedValues[columnIndex++] = storedValues[column.Index];
                    }
                    result.Rows[rowIndex] = new object[curatedValues.Length];
                    curatedValues.CopyTo(result.Rows[rowIndex], 0);
                }

                result.Contributions = new Contributor[allTheTests.Length];
                for (int i = 0; i < allTheTests.Length; i++)
                    result.Contributions[i] = allTheTests[i].Contributions[0];
            }

            object[] getHistoricalData(IEnumerable<CuratedDataset> tests, string method, string columnName, int capacity)
            {
                var history = new List<object>(capacity);

                foreach (var data in tests)
                    foreach (var row in data.Rows)
                        if (string.Equals(row[method_column_index], method))
                        {
                            CuratedDatasetColumn column = findColumn(data, columnName);

                            if (column == null) history.Add(null);
                            else switch (column.UnitKind)
                                {
                                    case UnitType.Time:
                                        history.Add(TryConvertBackTo(TimeUnit.Nanosecond, row[column.Index]));
                                        break;

                                    case UnitType.Size:
                                        history.Add(TryConvertBackTo(SizeUnit.B, row[column.Index]));
                                        break;

                                    default:
                                        if (double.TryParse(Convert.ToString(row[column.Index])?.Replace(",", ""), out double number))
                                            history.Add(number);
                                        else
                                            history.Add(null);
                                        break;
                                }
                            break;
                        }

                return history.ToArray();
            }

            CuratedDatasetColumn findColumn(CuratedDataset dataset, string name) => dataset.Columns.Where(x => x.Name == name).FirstOrDefault();

            return result;
        }

        internal static Contributor FetchRepositoryInfo(Summary summary, bool captureEmail)
        {
            string cwd = summary?.ResultsDirectoryPath;
            if (string.IsNullOrEmpty(cwd)) throw new ArgumentNullException(nameof(cwd));

            try
            {
                using (var repo = new Repository(Repository.Discover(cwd)))
                {
                    Commit lastCommit = repo.Commits.FirstOrDefault();
                    if (lastCommit == null) return null;
                    else
                    {
                        var newAndModifiedFiles = repo.RetrieveStatus().Where(x =>
                            x.State.HasFlag(FileStatus.NewInIndex) || x.State.HasFlag(FileStatus.NewInWorkdir) ||
                            x.State.HasFlag(FileStatus.ModifiedInIndex) || x.State.HasFlag(FileStatus.ModifiedInWorkdir) ||
                            x.State.HasFlag(FileStatus.RenamedInIndex) || x.State.HasFlag(FileStatus.RenamedInWorkdir));

                        string email = (captureEmail ? lastCommit.Committer.Email : null);
                        return new Contributor
                        {
                            HardwareInformation = string.Join(Environment.NewLine, summary.HostEnvironmentInfo.ToFormattedString()),
                            Branch = repo.Branches.First(x => x.IsCurrentRepositoryHead && !x.IsRemote).FriendlyName,
                            WasClean = (newAndModifiedFiles.Count() == 0),
                            CommitMessage = lastCommit.MessageShort,
                            Date = lastCommit.Committer.When.Date,
                            Author = lastCommit.Committer.Name,
                            Sha = lastCommit.Sha,
                            EmailMD5 = Hash(email),
                            Email = email,
                        };
                    }
                }
            }
            catch (Exception ex) { Console.WriteLine($"  Could not obtain Git information. {ex.Message}"); }
            return null;
        }

        internal static string ResolveCollectionName(Summary summary)
        {
            var targets = summary.BenchmarksCases.Select(b => b.Descriptor.Type).Distinct().ToArray();
            if (targets.Length == 1)
                return FolderNameHelper.ToFolderName(targets.Single()).Replace(".", "_");

            return summary.Title.Replace(".", "_");
        }

        internal static string Hash(string text)
        {
            if (string.IsNullOrEmpty(text)) return text;

            using (var md5 = System.Security.Cryptography.MD5.Create())
            {
                return BitConverter.ToString(md5.ComputeHash(Encoding.UTF8.GetBytes(text)));
            }
        }

        #region Private Members

        private const int method_column_index = 0;
        private static readonly Regex _unitPattern = new Regex(@"(?<value>(\d+,?)+(\.\d+)?) *(?<unit>[a-z]+)?", RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private static readonly IDictionary<MultiEncodingString, TimeUnit> _unitsOfTime = TimeUnit.All.ToDictionary(x => x.Name);
        private static readonly IDictionary<string, SizeUnit> _unitsOfSize = SizeUnit.All.ToDictionary(x => x.Name);

        private readonly bool _captureEmail;
        private readonly string _fileName, _templateName;

        private static object TryConvertBackTo(TimeUnit unit, object value)
        {
            if (value == null) return value;

            Match match = _unitPattern.Match(value.ToString());
            if (match.Success)
            {
                TimeUnit original = _unitsOfTime[match.Groups["unit"].Value];
                return new ScaledValue(
                    value: TimeUnit.Convert(Convert.ToDouble(match.Groups["value"].Value.Replace(",", "")), original, unit),
                    friendlyValue: match.Value.Trim());
            }
            else return null;
        }

        private static object TryConvertBackTo(SizeUnit unit, object value)
        {
            if (value == null) return value;
            Match match = _unitPattern.Match(value.ToString());
            if (match.Success)
            {
                SizeUnit original = _unitsOfSize[match.Groups["unit"].Value];
                return new ScaledValue(
                    value: (Convert.ToDouble(match.Groups["value"].Value.Replace(",", "")) * original.ByteAmount),
                    friendlyValue: match.Value.Trim());
            }
            else return null;
        }

        private static IEnumerable<object> NormalizeTimeUnits(IList<object> values)
        {
            var bestUnit = TimeUnit.GetBestTimeUnit((from x in values where x is ScaledValue select ((ScaledValue)x).Value).ToArray());
            foreach (var item in values)
                if (item is ScaledValue sv)
                    yield return new ScaledValue(TimeUnit.Convert(sv.Value, TimeUnit.Nanosecond, bestUnit), sv.FriendlyValue);
                else
                    yield return null;
        }

        private static IEnumerable<object> NormalizeSizeUnits(IList<object> values)
        {
            var bestUnit = SizeUnit.GetBestSizeUnit((from x in values where x is ScaledValue select Convert.ToInt64(((ScaledValue)x).Value)).ToArray());
            foreach (var item in values)
                if (item is ScaledValue sv)
                    yield return new ScaledValue(SizeUnit.Convert(Convert.ToInt64(sv.Value), SizeUnit.B, bestUnit), sv.FriendlyValue);
                else
                    yield return null;
        }

        #endregion Private Members
    }
}