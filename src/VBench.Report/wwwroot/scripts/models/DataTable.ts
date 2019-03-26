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
            this.jobs = ko.observableArray();
        }

        public name: KnockoutObservable<string>;
        public description: KnockoutObservable<string>;

        public jobs: KnockoutObservableArray<string>;
        public rows: KnockoutObservableArray<DataRow>;
        public columns: KnockoutObservableArray<DataColumn>;

        public addColumn(model: any): DataColumn {
            let newColumn = new DataColumn(this, model);
            Service.restoreColumn(newColumn);
            this.columns.push(newColumn);
            return newColumn;
        }

        public addRow(model: any): DataRow {
            let newRow = new DataRow(this, model);
            this.rows.push(newRow);
            return newRow;
        }

        public recalculate(): void {
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

        public sort(): void {
            for (let i = 0; i < this.columns().length; i++) {
                if (this.columns()[i].isSelected()) {
                    this.columns()[i].sort(false);
                }
            }
        }

        public adjustColumns(): void {
            for (let i = 0; i < this.columns().length; i++) {
                let column = this.columns()[i];

                if (!column.isHidden()) {
                    this.columns()[i].alignCells();
                }
            }
        }
    }
}