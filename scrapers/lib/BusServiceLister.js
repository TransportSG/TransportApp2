let PaginatedRequestor = require('./PaginatedRequestor');

module.exports = class BusServiceLister {

    constructor(accessKey) {
        this.requestor = new PaginatedRequestor('BusServices', accessKey);
        this.data = [];
    }

    getData(callback) {
        this.requestor.performRequest().then(data => {
            this.data = data;

            if (callback) callback(data);
        });
    }

}
