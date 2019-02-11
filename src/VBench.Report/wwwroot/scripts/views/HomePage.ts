/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../components/ChartEditor.ts" />
/// <reference path="../domain/Repository.ts" />
/// <reference path="../models/ISelectable.ts" />
/// <reference path="../models/DataRow.ts" />

namespace VBench {
    export class HomePage {
        constructor() {
            this._repository = new Repository();
            this.chartEditor = new ChartEditor(this._repository);
            this.chartEditor.changeDataset(this._repository.fetchNamesOfAllDatasets()[0]);

            this.attachEventHandlers();
        }

        private readonly _repository: Repository;

        public readonly chartEditor: ChartEditor;

        private attachEventHandlers(): void {
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
                    me.chartEditor.toggleChartLines();
                });
            }
        }
    }
}