﻿/// <reference path="../models/DataTable.ts" />
/// <reference path="../models/DataColumn.ts" />
/// <reference path="../models/DataRow.ts" />
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
            result.totalTestRuns = dataset.totalTestRuns;
            result.id(datasetId);
            result.clear();

            let calculatedValues: Array<any> = [];
            let numberOfColumns = dataset.columns.length;
            for (let i = 0; i < numberOfColumns; i++) {
                result.addColumn(dataset.columns[i]);
                calculatedValues.push(null);
            }

            let method: string = null;
            let initializeCalculatedRow: boolean = true;

            for (let i = 0; i < dataset.rows.length; i++) {
                let record: any = dataset.rows[i];

                method = record.values[ColumnIndex.Method];
                initializeCalculatedRow = calculatedValues[ColumnIndex.Method] !== method;
                calculatedValues = this.resolveCalculatedValue(calculatedValues, record.values, (i > 0 ? dataset.rows[i - 1].values : record.values), initializeCalculatedRow);

                if (record.values[ColumnIndex.TestNo] === dataset.totalTestRuns) {
                    result.addRow(record, calculatedValues);
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

        private resolveCalculatedValue(current: Array<any>, next: Array<any>, prev: Array<any>, initialize: boolean): Array<any> {
            let result = next;
            switch (Repository.comparisonKind) {
                default:
                    result = prev;
                    break;
            }

            return result;
        }
    }
}