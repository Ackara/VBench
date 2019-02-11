/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />
namespace VBench {
    export interface ISelectable {
        isSelected: KnockoutObservable<boolean>;
    }
}