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
            this._chart = this.createLineChart();
        }

        private readonly _chart: Chart;
        private readonly _repository: Repository;
        private readonly _colorPicker: ColorGenerator;

        public options: DataTable;
        private _linesEnabled: boolean;
        private _selectedDatasetId: string;

        public changeDataset(datasetId: string = null): void {
            this._selectedDatasetId = (datasetId ? datasetId : this._selectedDatasetId);
            this._repository.fetchLastestBenchmark(this._selectedDatasetId, this.options);

            this._chart.data.labels.splice(0, this._chart.data.labels.length);
            for (let i = 0; i < this.options.totalTests; i++) {
                this._chart.data.labels.push(`Test-${i + 1}`);
            }

            while (this._chart.data.datasets.length > 0) {
                this._chart.data.datasets.pop();
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
                    let series = this.createSeriesBaseSettings();
                    series.data = dataPoints;
                    series.label = seriesId;
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
            this._chart.update();
        }

        public toggleChartLines(): boolean {
            this._linesEnabled = !this._linesEnabled;
            let config = this.createSeriesBaseSettings();

            this._chart.data.datasets.forEach((dataset) => {
                dataset.showLine = this._linesEnabled;
                dataset.pointStyle = config.pointStyle;
                dataset.pointRadius = config.pointRadius;
                dataset.pointBorderWidth = config.pointBorderWidth;
            });
            this._chart.update();
            return this._linesEnabled;
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

        private createSeriesBaseSettings(): Chart.ChartDataSets {
            let color = this._colorPicker.newColor();

            let config: Chart.ChartDataSets = {
                fill: false,
                pointHitRadius: 20,
                showLine: this._linesEnabled,
                backgroundColor: color.getValue(),
                borderColor: [color.getValue(0.75)],
                pointRadius: (this._linesEnabled ? 3 : 20),
                pointBorderWidth: (this._linesEnabled ? 6 : 6),
                pointStyle: (this._linesEnabled ? "circle" : "line"),
            };

            return config;
        }
    }
}