using BenchmarkDotNet.Exporters;
using BenchmarkDotNet.Helpers;
using BenchmarkDotNet.Loggers;
using BenchmarkDotNet.Reports;
using LibGit2Sharp;
using LiteDB;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Acklann.VBench
{
    public class VisualExporter : IExporter
    {
        public VisualExporter()
        {
            Name = $"{nameof(VBench)}";
            _dbname = $"{nameof(VBench)}.litedb".ToLowerInvariant();
        }

        public string Name { get; }

        public void ExportToLog(Summary summary, ILogger logger)
        {
        }

        public IEnumerable<string> ExportToFiles(Summary summary, ILogger consoleLogger)
        {
            string databaseFilePath = Path.Combine(summary.ResultsDirectoryPath, _dbname);
            UpdateDatabase(summary, databaseFilePath);

            return new string[] { databaseFilePath };
        }

        internal static void UpdateDatabase(Summary summary, string databaseFilePath)
        {
            if (summary == null) throw new ArgumentNullException(nameof(summary));
            if (string.IsNullOrEmpty(databaseFilePath)) throw new ArgumentNullException(nameof(databaseFilePath));

            using (var db = new LiteDatabase(databaseFilePath))
            {
                var store = db.GetCollection<BenchmarkResult>(ResolveCollectionName(summary));

                var result = new BenchmarkResult();
                result.Name = store.Name;
                result.Date = DateTime.UtcNow;
                result.HostInformation = string.Join(Environment.NewLine, summary.HostEnvironmentInfo.ToFormattedString());

                var columns = new List<BenchmarkResultColumn>();
                foreach (var column in summary.Table.Columns)
                {
                    columns.Add(new BenchmarkResultColumn
                    {
                        Name = column.OriginalColumn.ColumnName,
                        UnitKind = column.OriginalColumn.UnitType,
                        IsNumeric = column.OriginalColumn.IsNumeric
                    });
                }
                result.Columns = columns.ToArray();
                result.Rows = summary.Table.FullContent;
                result.CommitInformation = GetRepositoryInfo(summary.ResultsDirectoryPath);

                store.Insert(result);
            }
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
                        var info = new CommitInfo();
                        info.Date = lastCommit.Committer.When.Date;
                        info.Author = lastCommit.Committer.Name;
                        info.Email = lastCommit.Committer.Email;
                        info.Message = lastCommit.Message;
                        info.Sha = lastCommit.Sha;

                        var uncommitedFiles = repo.RetrieveStatus();
                        info.IsClean = (uncommitedFiles.Count() == 0);
                        return info;
                    }
                }
            }
            catch (Exception ex) { Console.WriteLine($"Could not obtain Git information. {ex.Message}"); }

            return null;
        }

        internal static string ResolveGitDirectory(string cwd)
        {
            if (string.IsNullOrEmpty(cwd)) throw new ArgumentNullException(nameof(cwd));

            /// Walking up the current directory to see if I find a '.git' folder.
            while (!string.IsNullOrEmpty(cwd))
            {
                if (Directory.Exists(Path.Combine(cwd, ".git"))) return cwd;
                // If I find a visual studio '.sln' file, and yet I still have not find a .git repo, I will assume the project is not not using git.
                else if (Directory.EnumerateFiles(cwd, "*.sln", SearchOption.TopDirectoryOnly).Count() > 0) break;

                cwd = Path.GetDirectoryName(cwd);
            }

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

        private readonly string _dbname;

        #endregion Private Members
    }
}