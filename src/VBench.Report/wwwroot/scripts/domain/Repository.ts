/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../models/DataColumn.ts" />
/// <reference path="../models/DataTable.ts" />
/// <reference path="../models/Contributor.ts" />
/// <reference path="../models/DataRow.ts" />

namespace VBench {
    export class Repository {
        constructor(id: string = "data") {
            this._data = JSON.parse(document.getElementById(id).innerHTML);
        }

        private readonly _data: Array<any>;

        public loadData(datasetId: string, out: DataTable, hosts: KnockoutObservableArray<Contributor>): DataTable {
            let result = (out || new DataTable());
            let dataset = this.fetchDataset(datasetId);
            let contributors: Array<any> = dataset.contributions;

            result.clear();
            result.name(datasetId);
            result.jobs(dataset.jobs);
            result.description(contributors[contributors.length - 1].hardwareInformation);

            let numberOfColumns = dataset.columns.length;
            for (let i = 0; i < numberOfColumns; i++) {
                result.addColumn(dataset.columns[i]);
            }

            for (let i = 0; i < dataset.rows.length; i++) {
                result.addRow(dataset.rows[i]);
            }
            result.sort();

            hosts.removeAll();
            for (let i = 0; i < contributors.length; i++) {
                hosts.push(Contributor.create(contributors[i]));
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

            return (this._data.length > 0 ? this._data[0] : null);
        }
    }
}