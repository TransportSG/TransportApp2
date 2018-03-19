let PaginatedRequestor = require('./PaginatedRequestor');

module.exports = class BusServiceRouteLister {

    constructor(accessKey) {
        this.requestor = new PaginatedRequestor('BusRoutes', accessKey);
        this.data = [];
    }

    parseData(data) {
        let finalData = {};

        data.forEach(stop => {
            let service = stop.ServiceNo;
            let direction = stop.Direction;

            if (!finalData[service]) finalData[service] = {};
            if (!finalData[service][direction]) finalData[service][direction] = [];

            finalData[service][direction].push({
                busStopCode: stop.BusStopCode,
                distance: stop.Distance,
                stopNumber: stop.StopSequence,
                firstBus: {
                    weekday: stop.WD_FirstBus,
                    saturday: stop.SAT_FirstBus,
                    sunday: stop.SUN_FirstBus
                },
                lastBus: {
                    weekday: stop.WD_LastBus,
                    saturday: stop.SAT_LastBus,
                    sunday: stop.SUN_LastBus
                }
            });
        });

        return finalData;
    }

    getData(callback) {
        this.requestor.performRequest().then(data => {
            this.data = this.parseData(data);

            if (callback) callback(this.data);
        });
    }

}
