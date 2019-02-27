/// <reference path="UnitType.ts" />

namespace VBench {
    export class Formatter {
        public static formatAsTime(nanoseconds: number): string {
            if (nanoseconds === 0) return "0 ns";

            var dimensions = ["ns", "us", "ms", "s"];
            let index = Math.floor(Formatter.log(1000, nanoseconds));
            nanoseconds = (nanoseconds / Math.pow(Math.pow(10, index), 3));
            let unit = dimensions[index];

            if (index >= dimensions.length && nanoseconds > 59.999999 /* seconds */) {
                nanoseconds = (nanoseconds / 60);
                unit = "min";
            }

            return `${this.formatAsNumber(nanoseconds)} ${unit}`;
        }

        public static formatAsBytes(bytes: number): string {
            if (bytes === 0) return "0 B";

            var dimensions = ["B", "KB", "MB", "GB", "TB"];
            let index = Math.floor(Formatter.log(1024, bytes));
            bytes = (bytes / Math.pow(1024, index));

            return `${this.formatAsNumber(bytes)} ${dimensions[index]}`;
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