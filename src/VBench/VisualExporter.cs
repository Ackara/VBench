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
using System.Text.RegularExpressions;

namespace Acklann.VBench
{
    public class VisualExporter : IExporter
    {
        public VisualExporter()
        {
            Name = $"{nameof(VBench)}";
            _name = $"{nameof(VBench).ToLowerInvariant()}";
        }

        internal const int TOTAL_INTERNAL_VALUES = 7;

        public string Name { get; }

        public void ExportToLog(Summary summary, ILogger logger)
        {
        }

        public IEnumerable<string> ExportToFiles(Summary summary, ILogger consoleLogger)
        {
            string databaseFilePath = Path.Combine(summary.ResultsDirectoryPath, $"{_name}.litedb");
            CuratedDataset lastestBenchmark = UpdateDatabase(summary, databaseFilePath);
            IEnumerable<CuratedDataset> mergedData = ExportDatabase(databaseFilePath);

            Assembly assembly = typeof(VisualExporter).Assembly;
            string reportFilePath = Path.Combine(summary.ResultsDirectoryPath, $"{_name}.html");
            using (Stream output = new FileStream(reportFilePath, System.IO.FileMode.Create, FileAccess.Write, FileShare.Read))
            using (Stream source = assembly.GetManifestResourceStream(assembly.GetManifestResourceNames().First(x => x.EndsWith(".html"))))
            {
                var html = new HtmlAgilityPack.HtmlDocument();
                html.Load(source);

                var script = html.GetElementbyId("data");
                script.RemoveAllChildren();
                script.AppendChild(html.CreateTextNode(JsonConvert.SerializeObject(mergedData, Formatting.Indented, _jsonSettings)));
                html.Save(output);
            }

            return new string[] { databaseFilePath, reportFilePath };
        }

        internal static CuratedDataset UpdateDatabase(Summary summary, string databaseFilePath)
        {
            if (summary == null) throw new ArgumentNullException(nameof(summary));
            if (string.IsNullOrEmpty(databaseFilePath)) throw new ArgumentNullException(nameof(databaseFilePath));

            using (var db = new LiteDatabase(databaseFilePath))
            {
                var store = db.GetCollection<CuratedDataset>(ResolveCollectionName(summary));

                var result = new CuratedDataset();
                result.Name = store.Name;
                result.Date = DateTime.UtcNow;
                result.HostInformation = string.Join(Environment.NewLine, summary.HostEnvironmentInfo.ToFormattedString());

                var columns = new List<CuratedDatasetColumn>();
                foreach (var column in summary.Table.Columns.Where(x => x.NeedToShow))
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
                result.CommitInformation = GetRepositoryInfo(summary.ResultsDirectoryPath);

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
                    var item = MergeCollection(store);
                    if (item?.Rows.Length > 0) yield return item;
                }
            }
        }

        internal static CuratedDataset MergeCollection(LiteCollection<CuratedDataset> store)
        {
            if (store == null) throw new ArgumentNullException(nameof(store));

            object[] storedValues, curatedValues;
            var curatedRows = new Stack<object[]>();
            CuratedDatasetColumn[] lastestColumns = null;
            var curatedColumns = new Stack<CuratedDatasetColumn>();
            var result = new CuratedDataset { Name = store.Name };
            int index; bool firstItem = true;

            foreach (CuratedDataset storedDataset in store.FindAll().OrderByDescending(x => x.TestNo))
            {
                if (firstItem) // The 1st item is the latest benchmark
                {
                    result.TestNo = storedDataset.TestNo;
                    result.HostInformation = storedDataset.HostInformation;
                    lastestColumns = storedDataset.Columns;

                    index = 0;
                    result.Columns = new CuratedDatasetColumn[(TOTAL_INTERNAL_VALUES + lastestColumns.Length)];
                    foreach (var column in Enumerable.Concat(CuratedDatasetColumn.GetInternalColumns(), lastestColumns))
                    {
                        result.Columns[index] = column.Clone();
                        result.Columns[index].Index = index++;
                    }
                }
                
                for (int rowIndex = 0; rowIndex < storedDataset.Rows.Length; rowIndex++)
                {
                    index = 0;
                    storedValues = storedDataset.Rows[rowIndex];
                    var internalValues = new object[TOTAL_INTERNAL_VALUES] {
                        storedDataset.TestNo, storedDataset.Date, storedDataset.HostInformation,
                        storedDataset.CommitInformation.Author, storedDataset.CommitInformation.Email, storedDataset.CommitInformation.Sha, storedDataset.CommitInformation.WasClean
                    };
                    curatedValues = new object[internalValues.Length + lastestColumns.Length];

                    foreach (object value in internalValues)
                        curatedValues[index++] = value;

                    foreach (var column in lastestColumns)
                        switch (column.UnitKind)
                        {
                            default:
                                curatedValues[index++] = storedValues[column.Index];
                                break;

                            case UnitType.Time:
                                curatedValues[index++] = TryConvertTime(storedValues[column.Index], TimeUnit.Nanosecond);
                                break;

                            case UnitType.Size:
                                curatedValues[index++] = TryConvertSize(storedValues[column.Index], SizeUnit.B);
                                break;
                        }
                    curatedRows.Push(curatedValues);
                }

                firstItem = false;
            }
            result.Rows = curatedRows.ToArray();
            return result;
        }

        internal static CommitInfo GetRepositoryInfo(string cwd)
        {
            if (string.IsNullOrEmpty(cwd)) throw new ArgumentNullException(nameof(cwd));

            try
            {
                using (var repo = new Repository(Repository.Discover(cwd)))
                {
                    Commit lastCommit = repo.Commits.FirstOrDefault();
                    if (lastCommit == null) return null;
                    else
                    {
                        var newAndModifiedFiles = repo.RetrieveStatus()
                            .Where(x =>
                                x.State.HasFlag(FileStatus.NewInIndex) || x.State.HasFlag(FileStatus.NewInWorkdir) ||
                                x.State.HasFlag(FileStatus.ModifiedInIndex) || x.State.HasFlag(FileStatus.ModifiedInWorkdir) ||
                                x.State.HasFlag(FileStatus.RenamedInIndex) || x.State.HasFlag(FileStatus.RenamedInWorkdir));

                        return new CommitInfo
                        {
                            WasClean = (newAndModifiedFiles.Count() == 0),
                            Date = lastCommit.Committer.When.Date,
                            Author = lastCommit.Committer.Name,
                            Email = lastCommit.Committer.Email,
                            Message = lastCommit.Message,
                            Sha = lastCommit.Sha
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

        #region Private Members

        private static readonly Regex _unitPattern = new Regex(@"(?<value>\d+(\.\d+)?) *(?<unit>[a-z]+)", RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private static readonly IDictionary<MultiEncodingString, TimeUnit> _unitsOfTime = TimeUnit.All.ToDictionary(x => x.Name);
        private static readonly IDictionary<string, SizeUnit> _unitsOfSize = SizeUnit.All.ToDictionary(x => x.Name);

        private static readonly JsonSerializerSettings _jsonSettings = new JsonSerializerSettings()
        {
            ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()
        };

        private readonly string _name;

        private static object TryConvertTime(object value, TimeUnit unit)
        {
            if (value == null) return value;

            Match match = _unitPattern.Match(value.ToString());
            if (match.Success)
            {
                TimeUnit oringinal = _unitsOfTime[match.Groups["unit"].Value];
                return TimeUnit.Convert(Convert.ToDouble(match.Groups["value"].Value), oringinal, unit);
            }

            return value;
        }

        private static object TryConvertSize(object value, SizeUnit unit)
        {
            if (value == null) return value;

            Match match = _unitPattern.Match(value.ToString());
            if (match.Success)
            {
                SizeUnit oringinal = _unitsOfSize[match.Groups["unit"].Value];
                return SizeUnit.Convert(Convert.ToInt64(match.Groups["value"].Value), oringinal, unit);
            }

            return value;
        }

        #endregion Private Members
    }
}