/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../domain/UnitType.ts" />
/// <reference path="../domain/Order.ts" />
/// <reference path="DataTable.ts" />

namespace VBench {
    export class DataColumn {
        constructor(parent: DataTable, model: any, index: number) {
            this.table = parent;
            this.index = index;
            this.unitKind = model.unitKind;
            this.isNumeric = model.isNumeric;

            this.order = ko.observable(Order.Asc);
            this.isSelected = ko.observable(false);
            this.name = ko.observable(model.name || "-");
        }

        public readonly table: DataTable;
        public readonly unitKind: UnitType;
        public readonly isNumeric: boolean;
        public index: number;

        public name: KnockoutObservable<string>;
        public order: KnockoutObservable<Order>;
        public isSelected: KnockoutObservable<boolean>;

        public sort(): void {
            let me = this;
            console.debug(`sorting ${this.name()} column [${this.order()}]`);

            this.table.rows.sort(function (x, y) {
                let xv = x.values()[me.index].rawValue;
                let yv = y.values()[me.index].rawValue;
                //console.debug(`${xv} === ${yv}`);

                if (xv > yv && me.order() === Order.Asc) return 1;
                else if (xv < yv && me.order() === Order.Asc) return -1;

                else if (xv > yv && me.order() === Order.Desc) return -1;
                else if (xv < yv && me.order() === Order.Desc) return 1;

                else return 0;
            });

            this.isSelected(true);
            this.order(this.order() === Order.Asc ? Order.Desc : Order.Asc);
        }
    }
}