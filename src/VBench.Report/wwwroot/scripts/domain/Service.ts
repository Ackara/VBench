/// <reference path="../components/Timeline.ts" />
/// <reference path="../models/DataColumn.ts" />
/// <reference path="../models/DataCell.ts" />
/// <reference path="DeltaComparison.ts" />
/// <reference path="Order.ts" />

namespace VBench {
    export class Service {
        public static sendHttpRequest(method: string, url: string, data: any, callback: (error, data) => void): void {
            let request = new XMLHttpRequest();
            request.open(method, url, true);
            request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    let result: any;
                    try { result = JSON.parse(this.responseText); } catch { result = false; }

                    if (callback) {
                        if (this.status === 200) {
                            callback(null, result);
                        }
                        else {
                            callback({ error: `failure: '${url}'; ${this.statusText}`, status: this.status, data: result }, result);
                        }
                    }
                }
            };
            request.send(JSON.stringify(data));
        }

        public static getData(url: string, data: any, callback: (error, data) => void): void {
            return this.sendHttpRequest("GET", url, data, callback);
        }

        public static postData(url: string, data: any, callback: (error, data) => void): void {
            return this.sendHttpRequest("POST", url, data, callback);
        }

        // ===== Local Storage ===== //

        public static canUseLocalStorage(): boolean {
            if (/Edge\/\d./i.test(navigator.userAgent) || /MSIE/i.test(navigator.userAgent)) {
                return false;
            }

            return window.hasOwnProperty("localStorage");
        }

        public static saveMostRecentDataset(name: string): void {
            if (this.canUseLocalStorage()) {
                window.localStorage.setItem("selectedDataset", name);
            }
        }

        public static getMostRecentDataset(): string {
            if (this.canUseLocalStorage()) {
                return window.localStorage.getItem("selectedDataset");
            }

            return null;
        }

        public static saveComparisonKey(value: DeltaComparison): void {
            if (this.canUseLocalStorage()) {
                window.localStorage.setItem("DeltaComparison", value.toString());
            }
        }

        public static getDeltaComparison(): number {
            if (this.canUseLocalStorage()) {
                return parseInt(window.localStorage.getItem("DeltaComparison")) || DeltaComparison.previous;
            }

            return DeltaComparison.previous;
        }

        public static saveColumn(column: DataColumn): void {
            if (this.canUseLocalStorage()) {
                let base = `${(column.table.name())}.${column.name()}_col`;

                let key = `${base}.order`;
                window.localStorage.removeItem(key);
                window.localStorage.setItem(key, `${column.order()}`);

                window.localStorage.setItem(`${base}.selected`, `${column.isSelected()}`);
                //console.debug(`set: ${key} = ${column.order() === Order.Asc ? 'Asc' : 'Desc'}`);
            }
        }

        public static restoreColumn(column: DataColumn): void {
            if (this.canUseLocalStorage()) {
                let base = `${(column.table.name())}.${column.name()}_col`;

                let key = `${base}.order`;
                column.order((parseInt(window.localStorage.getItem(key)) || Order.Asc));
                //console.debug(`restore: ${key} = ${column.order() === Order.Asc ? 'Asc' : 'Desc'}`);

                key = `${base}.selected`;
                column.isSelected(JSON.parse(window.localStorage.getItem(key)) || false);
                //console.debug(`restore: ${key} = ${column.isSelected()}`);
            }
        }

        public static saveCell(cell: DataCell): void {
            if (this.canUseLocalStorage()) {
                let key = `${cell.row.table.name()}.${cell.row.table.columns()[cell.columnIndex].name()}.row${cell.row.index}`;

                if (cell.isSelected()) {
                    window.localStorage.setItem(key, `${cell.isSelected()}`);
                }
                else {
                    window.localStorage.removeItem(key);
                }
                //console.debug(`set: ${key} = ${cell.isSelected()}`);
            }
        }

        public static restoreCell(cell: DataCell): void {
            if (this.canUseLocalStorage()) {
                let key = `${cell.row.table.name()}.${cell.row.table.columns()[cell.columnIndex].name()}.row${cell.row.index}`;
                cell.isSelected(JSON.parse(window.localStorage.getItem(key)) || false);
                //console.debug(`restore: ${key} = ${cell.isSelected()}`);
            }
        }

        public static saveTimeline(timeline: Timeline): void {
            if (this.canUseLocalStorage()) {
                window.localStorage.setItem("timeline.lines", `${timeline.linesEnabled()}`);
                //console.debug(`set: timeline.lines = ${timeline.linesEnabled()}`);
            }
        }

        public static restoreTimeline(timeline: Timeline): void {
            if (this.canUseLocalStorage()) {
                timeline.linesEnabled(JSON.parse(window.localStorage.getItem("timeline.lines")) || timeline.linesEnabled);
                //console.debug(`restore: timeline.lines = ${timeline.linesEnabled()}`);
            }
        }
    }
}