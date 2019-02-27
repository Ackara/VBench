/// <reference path="../../../node_modules/@types/knockout/index.d.ts" />

namespace VBench {
    export class Contributor {
        constructor() {
            let me = this;
            this.email = ko.observable();
            this.commitId = ko.observable();
            this.emailHash = ko.observable();
            this.hardwareInformation = ko.observable();
            this.date = ko.observable();
            this.author = ko.observable();
            this.testNo = ko.observable();
            this.branch = ko.observable();
            this.wasClean = ko.observable();

            this.avatar = ko.pureComputed(function () {
                return `https://www.gravatar.com/avatar/${me.emailHash()}?s=32`;
            });
        }

        public testNo: KnockoutObservable<number>;
        public author: KnockoutObservable<string>;
        public date: KnockoutObservable<Date>;
        public branch: KnockoutObservable<string>;
        public email: KnockoutObservable<string>;
        public emailHash: KnockoutObservable<string>;
        public commitId: KnockoutObservable<string>;
        public avatar: KnockoutObservable<string>;
        public wasClean: KnockoutObservable<boolean>;
        public hardwareInformation: KnockoutObservable<string>;

        public static create(model: any): Contributor {
            let r = new Contributor();
            r.hardwareInformation(model.hardwareInformation);
            r.emailHash(model.emailMD5);
            r.email(model.email);
            r.commitId(model.sha);
            r.author(model.author);
            r.branch(model.branch);
            r.date(new Date(Date.parse(model.date)));
            r.wasClean(model.wasClean);
            return r;
        }

        public copy(x: Contributor): Contributor {
            this.hardwareInformation(x.hardwareInformation());
            this.emailHash(x.emailHash());
            this.commitId(x.commitId());
            this.email(x.email());
            this.date(x.date());
            this.author(x.author());
            this.branch(x.branch());
            return this;
        }
    }
}