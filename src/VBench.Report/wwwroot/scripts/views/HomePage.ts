/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../components/Timeline.ts" />
/// <reference path="../domain/Repository.ts" />
/// <reference path="../models/DataRow.ts" />

namespace VBench {
    export class HomePage {
        constructor() {
            this._repository = new Repository();
            let datasetNames: Array<string> = this._repository.fetchDatasetNames();
            this.datasetTabs = ko.observableArray(datasetNames);
            this.selectedDataset = ko.observable(datasetNames[0]);

            this.timeline = new Timeline(this._repository);
            this.timeline.changeDataset(datasetNames[0]);
        }

        private readonly _repository: Repository;
        public readonly timeline: Timeline;

        public selectedDataset: KnockoutObservable<string>;
        public datasetTabs: KnockoutObservableArray<string>;

        public attachEventHandlers(): void {
            let me = this;
            document.getElementById("timeline-table").addEventListener("click", function (e) {
                let context = ko.contextFor(e.target);
                if (context.$data.typeId === DataCell.TypeCode) {
                    let cell: DataCell = context.$data;
                    if (cell.isNumeric()) {
                        cell.isSelected(!cell.isSelected());
                        me.timeline.updateChart(cell);
                    }
                    console.debug(`${cell.unitKind}: ${cell.isNumeric()}`);
                }
            });

            let btn = document.getElementById("chart-lines-btn");
            if (btn) {
                btn.addEventListener("click", function (e) {
                    let on = me.timeline.toggleChartLines();
                    let value = btn.getElementsByClassName("chart-lines-btn-value")[0];
                    value.innerHTML = (on ? "on" : "off");
                });
            }

            let menu = <HTMLSelectElement>document.getElementById("compute-menu");
            if (menu) {
                menu.addEventListener("click", function (e) {
                    DataCell.comparisonKind = menu.selectedIndex;
                    me.timeline.data.refresh();
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
                    me.timeline.changeDataset(context.$data);
                    me.selectedDataset(context.$data);
                });
            }
            tabs[0].classList.add("is-active");

            let sortButtons = document.getElementsByClassName("sortable");
            for (let i = 0; i < sortButtons.length; i++) {
                sortButtons[i].addEventListener("click", function (e) {
                    me.timeline.data.reset();

                    let context = ko.contextFor(this);
                    let col = <DataColumn>context.$data;
                    col.sort();
                });
            }
        }
    }
}