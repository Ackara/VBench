/// <reference path="../models/DataTable.ts" />
/// <reference path="../models/DataColumn.ts" />
/// <reference path="../models/DataRow.ts" />
/// <reference path="ColumnIndex.ts" />

namespace VBench {
    export class Repository {
        constructor(id: string = "data") {
            this._data = JSON.parse(document.getElementById(id).innerHTML);
        }

        private readonly _data: Array<any>;

        public fetchLastestBenchmark(datasetId: string, out: DataTable = null): DataTable {
            let result = (out || new DataTable());

            let dataset = this.fetchDataset(datasetId);
            result.totalTestRuns = dataset.totalTestRuns;
            result.id(datasetId);
            result.clear();

            for (let i = 0; i < dataset.columns.length; i++) {
                result.addColumn(dataset.columns[i]);
            }

            for (let i = 0; i < dataset.rows.length; i++) {
                let record: any = dataset.rows[i];

                if (record.values[ColumnIndex.TestNo] === dataset.totalTestRuns) {
                    result.addRow(record);
                }
            }

            return result;
        }

        public fetchDataPoints(datasetId: string, benchmarkId: string, columnIndex: number): Array<number> {
            let results: Array<number> = [];
            let row: any;

            let dataset: any = this.fetchDataset(datasetId);
            if (dataset) {
                for (let i = 0; i < dataset.rows.length; i++) {
                    row = dataset.rows[i];
                    if (row.values[ColumnIndex.Method] === benchmarkId) {
                        results.push(<number>row.values[columnIndex]);
                    }
                }
            }

            return results;
        }

        public fetchNamesOfAllDatasets(): Array<string> {
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