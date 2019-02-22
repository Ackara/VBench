using BenchmarkDotNet.Columns;

namespace Acklann.VBench
{
    public class BenchmarkResultColumn
    {
        public string Name { get; internal set; }

        public bool IsNumeric { get; internal set; }

        public UnitType UnitKind { get; internal set; }
    }
}