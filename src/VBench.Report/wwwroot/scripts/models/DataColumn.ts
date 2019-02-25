/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../domain/UnitType.ts" />
/// <reference path="ISelectable.ts" />
/// <reference path="DataTable.ts" />

namespace VBench {
    export class DataColumn implements ISelectable {
        constructor(parent: DataTable, model: any) {
            this.table = parent;
            this.unitKind = model.unitKind;
            this.isNumeric = model.isNumeric;

            this.name = ko.observable(model.name || "-");
            this.isSelected = ko.observable(false);
            this.shouldHide = ko.observable(false);
        }

        public static readonly TypeId: number = 2;
        public readonly typeId: number = DataColumn.TypeId;
        public readonly table: DataTable;
        public readonly unitKind: UnitType;
        public readonly isNumeric: boolean

        public name: KnockoutObservable<string>;
        public isSelected: KnockoutObservable<boolean>;

        public shouldHide: KnockoutObservable<boolean>;
    }
}