using BenchmarkDotNet.Columns;
using Newtonsoft.Json;
using System;

namespace Acklann.VBench
{
    public class CuratedDatasetColumn : ICloneable
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

        internal static CuratedDatasetColumn[] GetInternalColumns()
        {
            int index = 0;
            return new CuratedDatasetColumn[VisualExporter.TOTAL_INTERNAL_VALUES]
            {
                new CuratedDatasetColumn(index++, nameof(CuratedDataset.TestNo), UnitType.Dimensionless),
                new CuratedDatasetColumn(index++, nameof(CuratedDataset.Date)),
                new CuratedDatasetColumn(index++, nameof(CuratedDataset.HostInformation)),
                new CuratedDatasetColumn(index++, nameof(CommitInfo.Author)),
                new CuratedDatasetColumn(index++, nameof(CommitInfo.Email)),
                new CuratedDatasetColumn(index++, nameof(CommitInfo.Sha)),
                new CuratedDatasetColumn(index++, nameof(CommitInfo.WasClean))
            };
        }

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