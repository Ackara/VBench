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
            this.selectedDataset = ko.observable(Service.getMostRecentDataset() || datasetNames[0]);
            this.selectedDataset.subscribe(function (newValue) { Service.saveMostRecentDataset(newValue); })

            DataCell.comparisonKind = Service.getDeltaComparison();
            this.timeline = new Timeline(this._repository);
            this.timeline.changeDataset(this.selectedDataset());
            this.timeline.restore();
        }

        private readonly _repository: Repository;
        public readonly timeline: Timeline;

        public selectedDataset: KnockoutObservable<string>;
        public datasetTabs: KnockoutObservableArray<string>;

        public attachEventHandlers(firstTime: boolean = false): void {
            let me: HomePage = this;

            if (firstTime) {
                let menu = <HTMLSelectElement>document.getElementById("compute-menu");
                if (menu) {
                    menu.selectedIndex = DataCell.comparisonKind;
                    menu.addEventListener("click", function (e) {
                        DataCell.comparisonKind = menu.selectedIndex;
                        Service.saveComparisonKey(DataCell.comparisonKind);
                        me.timeline.data.recalculate();
                    }, { passive: true });
                }

                let btn = document.getElementById("chart-lines-btn");
                if (btn) {
                    btn.addEventListener("click", function (e) {
                        me.timeline.toggleChartLines();
                    });
                }

                let tabs = document.getElementsByClassName("tab-btn");
                for (let i = 0; i < tabs.length; i++) {
                    tabs[i].addEventListener("click", function (e) {
                        let context = ko.contextFor(this);
                        me.timeline.changeDataset(context.$data);
                        me.selectedDataset(context.$data);
                        me.attachEventHandlers();
                    });
                }
            }

            document.getElementById("timeline-table").addEventListener("click", function (e) {
                let context = ko.contextFor(e.target);
                if (context.$data.typeId === DataCell.TypeCode) {
                    let cell: DataCell = context.$data;
                    if (cell.isNumeric()) {
                        cell.isSelected(!cell.isSelected());
                        me.timeline.updateChart(cell);
                    }
                }
            });

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