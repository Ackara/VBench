/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../domain/UnitType.ts" />
/// <reference path="DataTable.ts" />

namespace VBench {
    export class DataColumn {
        constructor(parent: DataTable, model: any) {
            this.table = parent;
            this.unitKind = model.unitKind;
            this.isNumeric = model.isNumeric;

            this.isSelected = ko.observable(false);
            this.name = ko.observable(model.name || "-");
        }

        public readonly table: DataTable;
        public readonly unitKind: UnitType;
        public readonly isNumeric: boolean;

        public name: KnockoutObservable<string>;
        public isSelected: KnockoutObservable<boolean>;
    }
}