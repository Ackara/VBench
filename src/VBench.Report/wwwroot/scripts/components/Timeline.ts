﻿/// <reference path="../../../node_modules/@types/chart.js/index.d.ts" />
/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../components/ColorGenerator.ts" />
/// <reference path="../domain/Repository.ts" />
/// <reference path="../domain/Formatter.ts" />
/// <reference path="../domain/Service.ts" />
/// <reference path="../models/DataTable.ts" />
/// <reference path="../models/DataCell.ts" />
/// <reference path="../models/Contributor.ts" />

namespace VBench {
    export class Timeline {
        constructor(data: Repository) {
            this._repository = data;
            this.data = new DataTable();
            this._colorPicker = new ColorGenerator();
            this._chart = this.createLineChart();

            this.linesEnabled = ko.observable(true);
            this.contributors = ko.observableArray();
            this.selectedContributor = new Contributor();
        }

        private readonly _chart: Chart;
        private readonly _repository: Repository;
        private readonly _colorPicker: ColorGenerator;
        private _selectedDatasetId: string;

        public data: DataTable;
        public selectedContributor: Contributor;
        public linesEnabled: KnockoutObservable<boolean>;
        public contributors: KnockoutObservableArray<Contributor>;
        public selectedContributorIndex: KnockoutObservable<number>;

        public restore(): void {
            Service.restoreTimeline(this);
            for (let x = 0; x < this.data.rows().length; x++) {
                let row = this.data.rows()[x].values();

                for (var y = 0; y < row.length; y++) {
                    if (row[y].isSelected()) {
                        this.updateChart(row[y]);
                    }
                }
            }
        }

        public changeDataset(datasetId: string, update: boolean = false): void {
            //console.debug(`switching to ${datasetId} dataset.`);
            this.data.clear();
            this._selectedDatasetId = (datasetId ? datasetId : this._selectedDatasetId);
            this._repository.loadData(this._selectedDatasetId, this.data, this.contributors);
            this.selectContributor(0);

            this._chart.data.labels.splice(0, this._chart.data.labels.length);
            while (this._chart.data.datasets.length > 0) {
                this._chart.data.datasets.pop();
            }

            if (update) {
                let selectedCells = this.data.getSelectedCells();
                for (let i = 0; i < selectedCells.length; i++) {
                    this.updateChart(selectedCells[i]);
                }
            }

            this._chart.update();
        }

        public updateChart(dataCell: DataCell): void {
            let benchmarkMethod: string = dataCell.row.key;
            let columnIndex: number = dataCell.columnIndex;
            let seriesId: string = `${benchmarkMethod} [${dataCell.row.table.columns()[columnIndex].name()}]`;

            if (dataCell.isSelected()) {
                console.debug(`${seriesId} |> add-series`);

                let dataPoints: Array<number> = dataCell.getDataPoints();

                if (dataPoints.length > 0) {
                    this._chart.data.labels.splice(0, this._chart.data.labels.length);
                    for (let i = 0; i < dataPoints.length; i++) {
                        this._chart.data.labels.push(`Test-${i + 1}`);
                    }

                    let series = this.createSeriesBaseSettings();
                    series.data = dataPoints;
                    series.label = seriesId;
                    (<any>series).vbench_unitType = dataCell.unitKind;
                    this._chart.data.datasets.push(series);
                }
                else {
                    console.debug("toast an error: no history");
                }
            }
            else {
                console.debug(`${seriesId} |> remove-series`);

                let series = this._chart.data.datasets;
                for (let i = 0; i < series.length; i++) {
                    if (series[i].label === seriesId) {
                        series.splice(i, 1);
                        break;
                    }
                }
            }

            Service.saveCell(dataCell);
            this._chart.update();
        }

        public selectContributor(index: number): Contributor {
            let item: Contributor = null;
            if (index < this.contributors().length) {
                item = this.selectedContributor.copy(this.contributors()[index]);
                item.testNo(index);
            }
            return item;
        }

        public toggleChartLines(): boolean {
            let me = this;
            this.linesEnabled(!this.linesEnabled());
            let config = this.createSeriesBaseSettings();
            Service.saveTimeline(this);

            this._chart.data.datasets.forEach((dataset) => {
                dataset.showLine = me.linesEnabled();
                dataset.pointStyle = config.pointStyle;
                dataset.pointRadius = config.pointRadius;
                dataset.pointBorderWidth = config.pointBorderWidth;
            });
            this._chart.update();
            return this.linesEnabled();
        }

        private createLineChart(): Chart {
            let me = this;
            let labelColor = this._colorPicker.textColor;
            let gridLineColor = this._colorPicker.textColor;
            return new Chart(<HTMLCanvasElement>document.getElementById("chart"), {
                type: 'line',
                data: { datasets: [] },
                options: {
                    scales: {
                        xAxes: [{
                            gridLines: {
                                color: gridLineColor.getValue(0.25)
                            },
                            ticks: {
                                fontColor: labelColor.getValue(0.75)
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                display: true,
                                color: gridLineColor.getValue(0.05)
                            },
                            ticks: {
                                display: false,
                                beginAtZero: true,
                                fontColor: labelColor.getValue(0.5)
                            }
                        }]
                    },
                    tooltips: {
                        titleFontSize: 18,
                        bodyFontSize: 18,
                        bodyFontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                        cornerRadius: 0,
                        xPadding: 12,
                        yPadding: 12,
                        callbacks: {
                            label: (item, data) => {
                                me.selectContributor(item.index);
                                let set = data.datasets[item.datasetIndex];
                                return ` ${set.label}: ${Formatter.format(<number>set.data[item.index], (<any>set).vbench_unitType)}`;
                            },
                            afterBody: (item, data) => {
                                let info = [
                                    '',
                                    `Tester: ${me.selectedContributor.author()}`,
                                    `Commit: ${me.selectedContributor.commitId().substring(0, 6)}`,
                                    '',
                                ];

                                return info.concat(me.selectedContributor.hardwareInformation().split("\n"));
                            }
                        }
                    }
                }
            });
        }

        private createSeriesBaseSettings(): Chart.ChartDataSets {
            let color = this._colorPicker.newColor();

            let config: Chart.ChartDataSets = {
                fill: false,
                pointHitRadius: 20,
                showLine: this.linesEnabled(),
                backgroundColor: color.getValue(),
                borderColor: [color.getValue(0.75)],
                pointRadius: (this.linesEnabled() ? 3 : 20),
                pointBorderWidth: (this.linesEnabled() ? 6 : 6),
                pointStyle: (this.linesEnabled() ? "circle" : "line"),
            };

            return config;
        }
    }
}