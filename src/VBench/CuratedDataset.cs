using LiteDB;
using Newtonsoft.Json;

namespace Acklann.VBench
{
    internal class CuratedDataset
    {
        [BsonId(autoId: true), JsonIgnore]
        public int TestNo { get; set; }

        public string Name { get; set; }

        public Contributor[] Contributions { get; internal set; }

        public CuratedDatasetColumn[] Columns { get; set; }

        public object[][] Rows { get; set; }
    }
}