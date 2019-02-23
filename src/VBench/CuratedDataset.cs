using LiteDB;
using System;

namespace Acklann.VBench
{
    public class CuratedDataset
    {
        [BsonId(autoId: true)]
        public int TestNo { get; set; }

        public string Name { get; set; }

        public string HostInformation { get; set; }

        public DateTime Date { get; internal set; }

        public CommitInfo CommitInformation { get; internal set; }

        public CuratedDatasetColumn[] Columns { get; set; }

        public object[][] Rows { get; set; }
    }
}