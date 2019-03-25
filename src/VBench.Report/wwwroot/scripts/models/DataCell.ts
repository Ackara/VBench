/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../domain/DeltaComparison.ts" />
/// <reference path="../domain/Formatter.ts" />
/// <reference path="../domain/UnitType.ts" />
/// <reference path="DataColumn.ts" />
/// <reference path="DataRow.ts" />

namespace VBench {
    export class DataCell {
        constructor(parent: DataRow, columnIndex: number, model: any) {
            this.row = parent;
            this.columnIndex = columnIndex;

            this.value = ko.observable();
            this.difference = ko.observable();
            this.isNumeric = ko.observable(false);
            this.isSelected = ko.observable(false);
            this.isHidden = ko.observable(parent.table.columns()[columnIndex].isHidden());

            this.computeValue(model, parent.table.columns()[columnIndex]);
            this.computeDifference();
        }

        public static comparisonKind: DeltaComparison = DeltaComparison.previous;
        public static readonly TypeCode: number = 3;
        public readonly typeId = DataCell.TypeCode;
        public readonly row: DataRow;
        public readonly columnIndex: number;
        public rawValue: any;

        public unitKind: UnitType;
        public history: Array<any>;

        public value: KnockoutObservable<any>;
        public difference: KnockoutObservable<any>;

        public isHidden: KnockoutObservable<boolean>;
        public isNumeric: KnockoutObservable<boolean>;
        public isSelected: KnockoutObservable<boolean>;

        // =============== Computation =============== //

        public computeValue(model: any, column: DataColumn) {
            this.unitKind = column.unitKind;

            if (column.isNumeric && Array.isArray(model)) {
                let array: Array<any> = this.history = model;
                this.isNumeric(array.length >= 2);

                switch (column.unitKind) {
                    default:
                        this.value(array[array.length - 1]);
                        this.rawValue = (array[array.length - 1]);
                        break;

                    case UnitType.time:
                    case UnitType.size:
                        let obj = array[array.length - 1];
                        this.value(obj ? obj.friendlyValue : null);
                        this.rawValue = (obj ? obj.friendlyValue : null);
                        break;
                }
            }
            else {
                this.value(model);
                this.rawValue = (model);
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
                        value = this.history[i];
                        points.push((value && (typeof value.value === "number") ? value.value : null))
                    }
                    break;
            }

            return points;
        }

        public computeDifference(): void {
            let values: Array<number> = this.getDataPoints();
            if (values.length === 0) return;

            let current: number, other: number;
            current = values[values.length - 1];

            if (current === null || current === undefined) { return; }

            switch (DataCell.comparisonKind) {
                case DeltaComparison.previous:
                    other = (values.length >= 2 ? values[values.length - 2] : current);
                    break;

                case DeltaComparison.min:
                    other = current;
                    for (let i = 0; i < values.length; i++) {
                        if (values[i] < other) { other = values[i]; }
                    }
                    break;

                case DeltaComparison.max:
                    other = current;
                    for (let i = 0; i < values.length; i++) {
                        if (values[i] > other) { other = values[i]; }
                    }
                    break;
            }

            if (other === null || other === undefined) { return; }

            let sign = (current >= other ? "+" : "-");
            let difference = Math.abs(current - other);
            let percentile: any = ((difference / (other === 0 ? 1 : other)) * 100);

            let output = `&Delta; ${sign}${Formatter.format(difference, this.unitKind)}`;
            if (percentile === 0) { }
            else if (percentile > 999) output += ` (>999%)`;
            else output += ` (${(percentile >= 1 ? percentile.toFixed(0) : percentile.toFixed(2))}%)`;

            this.difference(output);
        }
    }
}