/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="ISelectable.ts" />
/// <reference path="DataRow.ts" />

namespace VBench {
    export class DataCell implements ISelectable {
        constructor(parent: DataRow, columnIndex: number, value: any) {
            let me = this;
            this.row = parent;
            this.columnIndex = columnIndex;
            this.value = ko.observable(value);
            this.isSelected = ko.observable(false);

            this.isNumeric = ko.pureComputed(function () {
                return typeof me.value() === "number";
            });

            let computedValue = this.row.calculatedValues[columnIndex];
            if (computedValue && (typeof computedValue === "number")) {
                computedValue = this.computeDifference(value, computedValue);
            }
            else { computedValue = null; }
            this.difference = ko.observable(computedValue);
        }

        public static readonly TypeCode: number = 3;
        public readonly typeId: number = DataCell.TypeCode;

        public readonly row: DataRow;
        public readonly columnIndex: number;

        public value: KnockoutObservable<any>;
        public difference: KnockoutObservable<any>;

        public isNumeric: KnockoutComputed<boolean>;
        public isSelected: KnockoutObservable<boolean>;

        public computeDifference(x: number, y: number): string {
            let sign = (x >= y ? "+" : "-");
            let value = Math.abs(x - y);
            let percentile = ((value / x) * 100).toFixed(0);

            return `[${sign} ${value} (${percentile}%)]`;
        }
    }
}