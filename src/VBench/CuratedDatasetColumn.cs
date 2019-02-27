using BenchmarkDotNet.Columns;
using Newtonsoft.Json;
using System;

namespace Acklann.VBench
{
    internal class CuratedDatasetColumn : ICloneable
    {
        public CuratedDatasetColumn()
        {
        }

        public CuratedDatasetColumn(int index, string name)
        {
            Index = index;
            Name = name;
        }

        public CuratedDatasetColumn(int index, string name, UnitType unit)
        {
            Name = name;
            Index = index;
            UnitKind = unit;
            IsNumeric = true;
        }

        [JsonIgnore]
        public int Index { get; set; }

        public string Name { get; set; }

        public bool IsNumeric { get; set; }

        public UnitType UnitKind { get; set; }

        #region ICloneable

        public CuratedDatasetColumn Clone()
        {
            return new CuratedDatasetColumn()
            {
                Name = Name,
                Index = Index,
                UnitKind = UnitKind,
                IsNumeric = IsNumeric
            };
        }

        object ICloneable.Clone() => Clone();

        #endregion ICloneable
    }
}