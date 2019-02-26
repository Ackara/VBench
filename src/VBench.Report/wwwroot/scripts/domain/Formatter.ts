/// <reference path="UnitType.ts" />

namespace VBench {
    export class Formatter {
        public static formatAsTime(nanoseconds: number): string {
            var symbols = ["ns", "us", "ms", "s"];
            let index = Math.floor(Formatter.log(1000, nanoseconds));
            nanoseconds = (nanoseconds / Math.pow(Math.pow(10, index), 3));
            let unit = symbols[index];

            if (index >= symbols.length && nanoseconds > 59 /* seconds */) {
                nanoseconds = (nanoseconds / 60);
                unit = "min";
            }

            return `${(nanoseconds % 1) < 0.001 ? nanoseconds.toFixed(0) : nanoseconds.toFixed(3)} ${unit}`;
        }

        public static formatAsBytes(bytes: number): string {
            var symbols = ["B", "KB", "MB", "GB", "TB"];
            let index = Math.floor(Formatter.log(1024, bytes));
            bytes = (bytes / Math.pow(1024, index));

            return `${bytes} ${symbols[index]}`;
        }

        public static formatAsNumber(value: number): string {
            return (new Intl.NumberFormat(navigator.language).format(value));
        }

        public static format(value: number, unit: UnitType): string {
            switch (unit) {
                case UnitType.size:
                    return this.formatAsBytes(value);

                case UnitType.time:
                    return this.formatAsTime(value);

                default:
                    return this.formatAsNumber(value);
            }
        }

        public static log(x: number, y: number): number {
            return Math.log(y) / Math.log(x);
        }
    }
}