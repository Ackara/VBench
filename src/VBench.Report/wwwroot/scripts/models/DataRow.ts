/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../domain/ColumnIndex.ts" />
/// <reference path="ISelectable.ts" />
/// <reference path="DataTable.ts" />
/// <reference path="DataCell.ts" />

namespace VBench {
    export class DataRow {
        constructor(parent: DataTable, model: any) {
            let me = this;
            this.table = parent;
            this.values = ko.observableArray();
            this.isSelected = ko.observable(false);
            this.benchmarkId = model.values[ColumnIndex.Method];

            for (let i = 0; i < model.values.length; i++) {
                this.values.push(new DataCell(this, i, model.values[i]));
            }

            this.method = ko.pureComputed(function () {
                return me.values()[ColumnIndex.Method].value();
            });

            this.testNumber = ko.pureComputed(function () {
                return me.values()[ColumnIndex.TestNo].value();
            });

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

        public readonly table: DataTable;
        public readonly benchmarkId: string;

        public method: KnockoutObservable<string>;
        public testNumber: KnockoutComputed<number>;
        public isSelected: KnockoutObservable<boolean>;

        public values: KnockoutObservableArray<DataCell>;
    }
}