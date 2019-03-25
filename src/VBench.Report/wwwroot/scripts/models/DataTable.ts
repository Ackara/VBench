/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="DataColumn.ts" />
/// <reference path="DataRow.ts" />

namespace VBench {
    export class DataTable {
        constructor() {
            this.name = ko.observable();
            this.rows = ko.observableArray();
            this.columns = ko.observableArray();
            this.description = ko.observable("");
        }

        public name: KnockoutObservable<string>;
        public description: KnockoutObservable<string>;

        public rows: KnockoutObservableArray<DataRow>;
        public columns: KnockoutObservableArray<DataColumn>;

        public addColumn(model: any): DataColumn {
            let newColumn = new DataColumn(this, model, this.columns().length);
            this.columns.push(newColumn);
            return newColumn;
        }

        public addRow(model: any): DataRow {
            let newRow = new DataRow(this, model);
            this.rows.push(newRow);
            return newRow;
        }

        public refresh(): void {
            for (let i = 0; i < this.rows().length; i++) {
                this.rows()[i].refresh();
            }
        }

        public clear(): void {
            this.rows.removeAll();
            this.columns.removeAll();
        }

        public reset(): void {
            for (let i = 0; i < this.columns().length; i++) {
                this.columns()[i].isSelected(false);
            }
        }
    }
}