/// <reference path="../domain/Color.ts" />

namespace VBench {
    export class ColorGenerator {
        constructor() {
            this._colors = [
                new Color(11, 95, 165),
                new Color(255, 148, 0),

                new Color(59, 20, 175),
                new Color(255, 213, 0),

                new Color(116, 9, 170),
                new Color(251, 254, 0),

                new Color(0, 153, 153),
                new Color(255, 116, 0),

                new Color(0, 204, 0),
                new Color(255, 0, 0)
            ];

            this.textColor = new Color(225, 225, 225);
            this.backgroundColor = new Color(30, 30, 30);
        }

        private _index: number = 0;
        private _colors: Array<Color>;

        public textColor: Color;
        public backgroundColor: Color;

        public newColor(): Color {
            this._index = (this._index < this._colors.length ? this._index : 0);
            return this._colors[this._index++];
        }

        public getCurrentColor(): Color {
            return this._colors[this._index];
        }
    }
}