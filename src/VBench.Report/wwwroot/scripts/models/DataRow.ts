/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../domain/ComparisonMethod.ts" />
/// <reference path="../domain/ColumnIndex.ts" />
/// <reference path="ISelectable.ts" />
/// <reference path="DataTable.ts" />
/// <reference path="DataCell.ts" />

namespace VBench {
    export class DataRow {
        constructor(parent: DataTable, model: any, calculatedValues: Array<any>) {
            let me = this;
            this.table = parent;
            this.calculatedValues = [];
            this.values = ko.observableArray();
            this.isSelected = ko.observable(false);
            this.calculatedValues = calculatedValues;
            this.benchmarkId = model[ColumnIndex.Method];

            let value: any;
            for (let columnIndex = 0; columnIndex < model.length; columnIndex++) {
                value = model[columnIndex];
                this.values.push(new DataCell(this, columnIndex, value));
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
        public static comparisonKind: ComparisonMethod = ComparisonMethod.previous;

        public method: KnockoutObservable<string>;
        public testNumber: KnockoutComputed<number>;
        public isSelected: KnockoutObservable<boolean>;

        public values: KnockoutObservableArray<DataCell>;
        public calculatedValues: Array<any>;
    }
}