/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="DataColumn.ts" />
/// <reference path="DataRow.ts" />

namespace VBench {
    export class DataTable {
        constructor() {
            this.id = ko.observable();
            this.rows = ko.observableArray();
            this.columns = ko.observableArray();
        }

        public totalTestRuns: number = 0;
        public id: KnockoutObservable<string>;
        public rows: KnockoutObservableArray<DataRow>;
        public columns: KnockoutObservableArray<DataColumn>;

        public addColumn(model: any): DataColumn {
            let newColumn = new DataColumn(this, model);
            this.columns.push(newColumn);
            return newColumn;
        }

        public addRow(model: any, calculatedValues: Array<any>): DataRow {
            let newRow = new DataRow(this, model, calculatedValues);
            this.rows.push(newRow);
            return newRow;
        }

        public clear(): void {
            this.rows.removeAll();
            this.columns.removeAll();
        }
    }
}