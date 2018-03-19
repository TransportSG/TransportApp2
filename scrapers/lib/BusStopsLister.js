let PaginatedRequestor = require('./PaginatedRequestor');

module.exports = class BusStopsLister {

    constructor(accessKey) {
        this.requestor = new PaginatedRequestor('BusStops', accessKey);
        this.data = [];
    }

    getData(callback) {
        this.requestor.performRequest().then(data => {
            this.data = data;

            if (callback) callback(data);
        });
    }

}
