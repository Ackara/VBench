using BenchmarkDotNet.Columns;

namespace Acklann.VBench
{
    public class CuratedDatasetColumn
    {
        public int Index { get; set; }

        public string Name { get; set; }

        public bool IsNumeric { get; set; }

        public UnitType UnitKind { get; set; }
    }
}