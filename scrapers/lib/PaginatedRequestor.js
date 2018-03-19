let request = require('request');

let baseURL = 'http://datamall2.mytransport.sg/ltaodataservice/';

module.exports = class PaginatedRequestor {

    constructor(pageName, accessKey, maxPages) {
        this.fullURL = baseURL + pageName;
        this.accessKey = accessKey;
        this.pages = [];
        this.currentPageNumber = 0;
        this.maxPages = maxPages !== undefined ? Math.max(maxPages, 1) : Infinity;
        
        this.completed = false;
    }

    performRequest() {
        if (this.completed) {
            return new Promise((accept, reject) => {
                accept(this.data);
            });
        }

        return new Promise((accept, reject) => {
            this.requestLoop(this.currentPageNumber, () => {

                accept(this.pages);
            });
        });
    }

    onPageRecievedCallback(callback, shouldContinue) {
        if (shouldContinue && this.currentPageNumber < this.maxPages) {
            this.requestLoop(++this.currentPageNumber, callback);
        } else {
            callback();
        }
    }

    requestLoop(currentPageNumber, callback) {
        this.getPage(currentPageNumber, this.onPageRecievedCallback.bind(this, callback));
    }

    getPage(number, callback) {
        request({
            url: `${this.fullURL}?$skip=${number * 500}`,
            headers: {
                AccountKey: this.accessKey,
                accept: 'application/json'
            }
        }, (err, resp, body) => {
            let data = JSON.parse(body).value;

            if (data.length > 0) {
                this.pages = this.pages.concat(data);

                callback(true);
            } else {
                callback(false);
            }
        });
    }

}
