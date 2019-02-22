using LiteDB;
using System;

namespace Acklann.VBench
{
    public class BenchmarkResult
    {
        [BsonId(autoId: true)]
        public int Id { get; set; }

        public string Name { get; set; }

        [BsonIgnore]
        public int TestNo { get; set; }

        public string HostInformation { get; set; }

        public DateTime Date { get; internal set; }

        public CommitInfo CommitInformation { get; internal set; }

        public BenchmarkResultColumn[] Columns { get; set; }

        public string[][] Rows { get; set; }
    }
}