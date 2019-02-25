/// <reference path="../models/DataTable.ts" />
/// <reference path="../models/DataColumn.ts" />
/// <reference path="../models/DataRow.ts" />
/// <reference path="ComparisonMethod.ts" />
/// <reference path="ColumnIndex.ts" />

namespace VBench {
    export class Repository {
        constructor(id: string = "data") {
            this._data = JSON.parse(document.getElementById(id).innerHTML);
        }

        private readonly _data: Array<any>;
        public static comparisonKind: ComparisonMethod = ComparisonMethod.previous;

        public fetchLastestBenchmark(datasetId: string, out: DataTable = null): DataTable {
            let result = (out || new DataTable());

            let dataset = this.fetchDataset(datasetId);
            result.totalTests = dataset.totalTests;
            result.name(datasetId);
            result.clear();

            let numberOfColumns = dataset.columns.length;
            for (let i = 0; i < numberOfColumns; i++) {
                let col = result.addColumn(dataset.columns[i]);
                col.shouldHide(i < ColumnIndex.Method);
            }

            for (let i = 0; i < dataset.rows.length; i++) {
                result.addRow(dataset.rows[i]);
            }

            return result;
        }

        public fetchDatasetNames(): Array<string> {
            let list: Array<string> = [];
            for (let i = 0; i < this._data.length; i++) {
                list.push(this._data[i].name);
            }

            return list;
        }

        public fetchDataset(datasetId: string): any {
            for (let i = 0; i < this._data.length; i++) {
                if (this._data[i].name === datasetId) {
                    return this._data[i];
                }
            }
            return null;
        }
    }
}