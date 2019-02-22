/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../components/ChartEditor.ts" />
/// <reference path="../domain/Repository.ts" />
/// <reference path="../models/ISelectable.ts" />
/// <reference path="../models/DataRow.ts" />

namespace VBench {
    export class HomePage {
        constructor() {
            this._repository = new Repository();
            let datasetNames: Array<string> = this._repository.fetchNamesOfAllDatasets();
            this.datasetTabs = ko.observableArray(datasetNames);
            this.selectedDataset = ko.observable(datasetNames[0]);

            this.chartEditor = new ChartEditor(this._repository);
            this.chartEditor.changeDataset(datasetNames[0]);
        }

        public readonly chartEditor: ChartEditor;

        public selectedDataset: KnockoutObservable<string>;
        public datasetTabs: KnockoutObservableArray<string>;

        private readonly _repository: Repository;

        public attachEventHandlers(): void {
            let me = this;
            document.getElementById("chartEditor").addEventListener("click", function (e) {
                let context = ko.contextFor(e.target);
                if (context.$data.typeId === DataCell.TypeCode) {
                    let cell: DataCell = context.$data;
                    if (cell.isNumeric()) {
                        cell.isSelected(!cell.isSelected());
                        me.chartEditor.updateChart(cell);
                    }
                }
            });

            let btn = document.getElementById("chart-lines-btn");
            if (btn) {
                btn.addEventListener("click", function (e) {
                    let on = me.chartEditor.toggleChartLines();
                    let value = btn.getElementsByClassName("chart-lines-btn-value")[0];
                    value.innerHTML = (on ? "on" : "off");
                });
            }

            let menu = <HTMLSelectElement>document.getElementById("compute-menu");
            if (menu) {
                menu.addEventListener("click", function (e) {
                    if (Repository.comparisonKind != menu.selectedIndex) {
                        Repository.comparisonKind = menu.selectedIndex;
                        me.chartEditor.changeDataset();
                    }
                }, { passive: true });
            }

            let tabs = document.getElementsByClassName("tab-btn");
            for (let i = 0; i < tabs.length; i++) {
                tabs[i].addEventListener("click", function (e) {
                    for (var t = 0; t < tabs.length; t++) {
                        tabs[t].classList.remove("is-active");
                    }

                    let context = ko.contextFor(this);
                    (<HTMLElement>this).classList.add("is-active");
                    me.chartEditor.changeDataset(context.$data);
                    me.selectedDataset(context.$data);
                });
            }
            tabs[0].classList.add("is-active");

            let infoBtn = document.getElementById("info-btn");
            if (infoBtn) {
                infoBtn.addEventListener("click", function (e) {
                    infoBtn.classList.toggle("is-active");
                    let info = document.getElementById("system-info");
                    if (info) { info.classList.toggle("is-active"); }
                });
            }
        }
    }
}