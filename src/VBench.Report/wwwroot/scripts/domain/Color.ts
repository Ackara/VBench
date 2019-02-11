namespace VBench {
    export class Color {
        constructor(r: number, g: number, b: number, a: number = 1) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }

        public readonly r: number;
        public readonly g: number;
        public readonly b: number;
        public readonly a: number;

        public getValue(alpha?: number): string {
            return `rgba(${this.r},${this.g},${this.b},${(alpha || this.a)})`;
        }
    }
}