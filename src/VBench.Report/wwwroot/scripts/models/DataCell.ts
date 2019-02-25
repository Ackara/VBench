/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../domain/ComparisonMethod.ts" />
/// <reference path="../domain/UnitType.ts" />
/// <reference path="DataColumn.ts" />
/// <reference path="DataRow.ts" />

namespace VBench {
    export class DataCell {
        constructor(parent: DataRow, columnIndex: number, value: any) {
            let me = this;
            this.row = parent;
            this.columnIndex = columnIndex;
            this.comparison = ko.observable(ComparisonMethod.previous);

            this.value = ko.observable();
            this.units = ko.observable("");
            this.difference = ko.observable();
            this.isNumeric = ko.observable(false);
            this.isSelected = ko.observable(false);
            this.isHidden = ko.observable((columnIndex < ColumnIndex.Method));
            this.computeValue(value, parent.table.columns()[columnIndex]);
            this.computeDifference();
        }

        public static readonly TypeCode: number = 3;
        public readonly typeId = DataCell.TypeCode;
        public readonly row: DataRow;
        public readonly columnIndex: number;

        public unitKind: UnitType;
        public history: Array<any>;

        public value: KnockoutObservable<any>;
        public units: KnockoutObservable<string>;
        public difference: KnockoutObservable<any>;
        public comparison: KnockoutObservable<ComparisonMethod>;

        public isNumeric: KnockoutObservable<boolean>;
        public isSelected: KnockoutObservable<boolean>;
        public isHidden: KnockoutObservable<boolean>;

        // =============== Computation =============== //

        public computeValue(model: any, column: DataColumn) {
            this.unitKind = column.unitKind;

            if (column.isNumeric && Array.isArray(model)) {
                this.isNumeric(true);
                let array: Array<any> = this.history = model;

                switch (column.unitKind) {
                    default:
                        this.value(array[array.length - 1]);
                        break;

                    case UnitType.time:
                    case UnitType.size:
                        let obj = array[array.length - 1];
                        this.value(obj.value);
                        break;
                }
            }
            else {
                this.value(model);
            }
        }

        public getDataPoints(): Array<number> {
            if (!this.isNumeric()) return [];

            let value: any;
            let points: Array<number> = [];

            switch (this.unitKind) {
                default:
                    for (let i = 0; i < this.history.length; i++) {
                        value = this.history[i];
                        points.push((typeof value === "number" ? value : null));
                    }
                    break;

                case UnitType.time:
                case UnitType.size:
                    for (let i = 0; i < this.history.length; i++) {
                        value = this.history[i].point;
                        points.push((typeof value === "number" ? value : null))
                    }
                    break;
            }

            return points;
        }

        public computeDifference(): void {
            let values: Array<number> = this.getDataPoints();
            if (values.length === 0) { return null; }

            let current: number, min: number, max: number, other;
            current = values[values.length - 1];

            switch (this.comparison()) {
                case ComparisonMethod.previous:
                    other = (values.length >= 2 ? values[values.length - 2] : current);
                    break;

                case ComparisonMethod.min:
                    other = current;
                    for (let i = 0; i < values.length; i++) {
                        if (values[i] < other) { other = values[i]; }
                    }
                    break;

                case ComparisonMethod.max:
                    other = current;
                    for (let i = 0; i < values.length; i++) {
                        if (values[i] > other) { other = values[i]; }
                    }
                    break;
            }

            let sign = (current >= other ? "+" : "-");
            let difference = Math.abs(other - current);
            let percentile = ((difference / other) * 100);

            this.difference(`[${sign}${difference} (${(percentile >= 1 ? percentile.toFixed(0) : percentile.toFixed(2))}%)]`);
        }
    }
}