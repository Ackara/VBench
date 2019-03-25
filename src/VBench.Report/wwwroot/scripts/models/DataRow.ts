/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../domain/ColumnIndex.ts" />
/// <reference path="DataTable.ts" />
/// <reference path="DataCell.ts" />

namespace VBench {
    export class DataRow {
        constructor(parent: DataTable, model: any) {
            let me = this;
            this.table = parent;
            this.values = ko.observableArray();
            this.key = model[ColumnIndex.Method];
            this.isSelected = ko.observable(false);
            this.index = parent.rows().length;

            for (let columnIndex = 0; columnIndex < model.length; columnIndex++) {
                let newCell = new DataCell(this, columnIndex, model[columnIndex]);
                Service.restoreCell(newCell);
                this.values.push(newCell);
            }

            this.isSelected = ko.pureComputed(function () {
                let selected = false;
                for (let i = 0; i < me.values().length; i++) {
                    if (me.values()[i].isSelected()) {
                        selected = true;
                        break;
                    }
                }
                return selected;
            });
        }

        public readonly key: string;
        public readonly table: DataTable;
        public readonly index: number;

        public isSelected: KnockoutObservable<boolean>;
        public values: KnockoutObservableArray<DataCell>;

        public refresh(): void {
            for (let i = 0; i < this.values().length; i++) {
                this.values()[i].computeDifference();
            }
        }
    }
}