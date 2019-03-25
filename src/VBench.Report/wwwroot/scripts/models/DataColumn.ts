/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../domain/UnitType.ts" />
/// <reference path="../domain/Order.ts" />
/// <reference path="DataTable.ts" />

namespace VBench {
    export class DataColumn {
        constructor(parent: DataTable, model: any) {
            let me = this;
            this.table = parent;
            this.unitKind = model.unitKind;
            this.isNumeric = model.isNumeric;
            this.index = parent.columns().length;

            this.order = ko.observable(Order.Asc);
            this.isSelected = ko.observable(false);
            this.name = ko.observable(model.name || "-");
            this.isHidden = ko.observable(model.isHidden);

            this.isSelected.subscribe(function (newValue) { Service.saveColumn(me); })
        }

        public readonly table: DataTable;
        public readonly unitKind: UnitType;
        public readonly isNumeric: boolean;
        public index: number;

        public name: KnockoutObservable<string>;
        public order: KnockoutObservable<Order>;
        public isHidden: KnockoutObservable<boolean>;
        public isSelected: KnockoutObservable<boolean>;

        public sort(invert: boolean = true): void {
            let me = this;
            if (invert) {
                this.order(this.order() === Order.Asc ? Order.Desc : Order.Asc);
                this.isSelected(true);
                Service.saveColumn(this);
            }

            console.debug(`sorting column[${this.name()}] ${this.order() === Order.Asc ? 'Asc' : 'Desc'}`);
            if (this.order() === Order.Asc) {
                this.table.rows.sort(function (x, y) {
                    let xv = x.values()[me.index].rawValue;
                    let yv = y.values()[me.index].rawValue;

                    if (xv > yv) return 1;
                    else if (xv < yv) return -1;
                    else return 0;
                });
            }
            else {
                this.table.rows.sort(function (x, y) {
                    let xv = x.values()[me.index].rawValue;
                    let yv = y.values()[me.index].rawValue;

                    if (xv > yv) return -1;
                    else if (xv < yv) return 1;
                    else return 0;
                });
            }
        }
    }
}