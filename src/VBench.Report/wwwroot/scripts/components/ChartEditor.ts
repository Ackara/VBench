/// <reference path="../../../node_modules/@types/chart.js/index.d.ts" />
/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../components/ColorGenerator.ts" />
/// <reference path="../domain/Repository.ts" />
/// <reference path="../models/DataTable.ts" />
/// <reference path="../models/DataCell.ts" />

namespace VBench {
    export class ChartEditor {
        constructor(data: Repository) {
            this._repository = data;
            this._linesEnabled = true;
            this.options = new DataTable();
            this._colorPicker = new ColorGenerator();
            this._lineChart = this.createLineChart();
        }

        private readonly _lineChart: Chart;
        private readonly _repository: Repository;
        private readonly _colorPicker: ColorGenerator;

        public options: DataTable;
        private _linesEnabled: boolean;

        public changeDataset(datasetId: string): void {
            this._repository.fetchLastestBenchmark(datasetId, this.options);

            for (let i = 0; i < this.options.totalTestRuns; i++) {
                this._lineChart.data.labels.push(`Run-${i + 1}`);
            }
            this._lineChart.update();
        }

        public updateChart(data: DataCell): void {
            let benchmarkId: string = data.row.method();
            let columnIndex: number = data.columnIndex;
            let seriesId: string = `${benchmarkId} [${data.row.table.columns()[columnIndex].name()}]`;

            if (data.isSelected()) {
                console.debug(`${seriesId} |> add-series`);

                let dataPoints = this._repository.fetchDataPoints(this.options.id(), benchmarkId, columnIndex);

                if (dataPoints.length > 0) {
                    let series = this.createSeriesBaseSettings();
                    series.data = dataPoints;
                    series.label = seriesId;
                    this._lineChart.data.datasets.push(series);
                }
                else {
                    console.debug("toast an error");
                }
            }
            else {
                console.debug(`${seriesId} |> remove-series`);

                let series = this._lineChart.data.datasets;
                for (let i = 0; i < series.length; i++) {
                    if (series[i].label === seriesId) {
                        series.splice(i, 1);
                        break;
                    }
                }
            }
            this._lineChart.update();
        }

        public toggleChartLines(): void {
            this._linesEnabled = !this._linesEnabled;
            let config = this.createSeriesBaseSettings();

            this._lineChart.data.datasets.forEach((dataset) => {
                dataset.showLine = this._linesEnabled;
                dataset.pointStyle = config.pointStyle;
                dataset.pointRadius = config.pointRadius;
                dataset.pointBorderWidth = config.pointBorderWidth;
            });
            this._lineChart.update();
        }

        private createSeriesBaseSettings(): Chart.ChartDataSets {
            let color = this._colorPicker.newColor();

            let config: Chart.ChartDataSets = {
                steppedLine: "after",
                pointHitRadius: 20,
                showLine: this._linesEnabled,
                borderColor: [color.getValue(0.75)],
                pointRadius: (this._linesEnabled ? 5 : 20),
                pointBorderWidth: (this._linesEnabled ? 15 : 6),
                pointStyle: (this._linesEnabled ? "circle" : "line"),
            };

            return config;
        }

        private createLineChart(): Chart {
            let labelColor = this._colorPicker.textColor.getValue(0.5);
            let gridLineColor = this._colorPicker.textColor.getValue(0.1);
            return new Chart(<HTMLCanvasElement>document.getElementById("chart"), {
                type: 'line',
                data: { datasets: [] },
                options: {
                    scales: {
                        xAxes: [{
                            gridLines: {
                                color: gridLineColor
                            },
                            ticks: {
                                fontColor: labelColor
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                color: gridLineColor
                            },
                            ticks: {
                                beginAtZero: true,
                                fontColor: labelColor
                            }
                        }]
                    }
                }
            });
        }
    }
}