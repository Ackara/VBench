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
    }
}