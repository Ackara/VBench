﻿/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="ISelectable.ts" />
/// <reference path="DataTable.ts" />

namespace VBench {
    export class DataColumn implements ISelectable {
        constructor(parent: DataTable, model: any) {
            this.table = parent;
            this.isSelected = ko.observable(false);
            this.name = ko.observable(model.name || "-");
            this.shouldHide = ko.observable(false);
        }

        public static readonly TypeId: number = 2;
        public readonly typeId: number = DataColumn.TypeId;

        public readonly table: DataTable;
        public name: KnockoutObservable<string>;
        public isSelected: KnockoutObservable<boolean>;
        public shouldHide: KnockoutObservable<boolean>;
    }
}