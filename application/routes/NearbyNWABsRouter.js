const Router = require('./Router');
const BusTimings = require('../../addons/BusTimings/BusTimings');
const BusStopsRepository = require('../../database/BusStopsRepository');
const BusServiceRepository = require('../../database/BusServiceRepository');
const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');
const BusTimingsUtils = require('../../utils/BusTimingsUtils');

var timingDiff = (a, b) => {
    var diff = new Date(Math.abs(a - b));
    return {
        minutes: diff.getUTCMinutes(),
        seconds: diff.getUTCSeconds(),
    }
};

class NearbyNWABsRouter extends Router {

    static init() {
        NearbyNWABsRouter.busStops = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
        NearbyNWABsRouter.busServices = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    }

    static index(req, res) {
        res.render('nearby-nwabs/index');
    }

    static getNWABsForBusStop(busStopTimings) {
        if (!busStopTimings) return [];
        
        return busStopTimings.filter(timings => {
            return !!timings.timings.filter(timing => !timing.isWAB).length;
        }).map(timings => {
            timings.timings = timings.timings.filter(timing => !timing.isWAB);
            return timings;
        });
    }

    static getDataForAllBusTimings(allTimings, callback) {
        var donePromises = [];

        var finalData = {};

        Object.keys(allTimings).forEach(busStopCode => {
            var timings = allTimings[busStopCode];
            donePromises.push(new Promise((resolve, reject) => {
                BusTimingsUtils.loadDataForBusStopTimings(NearbyNWABsRouter.busServices, NearbyNWABsRouter.busStops, timings, (timings, servicesData) => {
                    finalData[busStopCode] = {timings, servicesData}
                    resolve();
                });
            }));
        });

        Promise.all(donePromises).then(() => {
            callback(finalData);
        })
    }

    static getDataForAllBusStops(busStopCodes, callback) {
        var promises = [];
        var busStopData = {};

        busStopCodes.forEach(busStopCode => {
            promises.push(new Promise((resolve, reject) => {
                NearbyNWABsRouter.busStops.findOne(busStopCode, (err, busStop) => {
                    busStopData[busStopCode] = busStop;
                    resolve();
                });
            }));
        });

        Promise.all(promises).then(() => {
            callback(busStopData);
        });
    }


    static doLookup(req, res) {
        let lat = req.query.lat * 1;
        let long = req.query.long * 1;

        NearbyNWABsRouter.busStops.locateNearby(lat, long, 0.00667, (err, busStops) => {
            var finalTimings = {};

            busStops.forEach(busStop => {
                var busStopTimings = BusTimings.getTimings()[busStop.busStopCode];
                var filtered = NearbyNWABsRouter.getNWABsForBusStop(busStopTimings);

                if (!!filtered.length) finalTimings[busStop.busStopCode] = filtered;
            });

            NearbyNWABsRouter.getDataForAllBusTimings(finalTimings, parsedData => {
                NearbyNWABsRouter.getDataForAllBusStops(Object.keys(finalTimings), busStopsData => {
                    res.render('nearby-nwabs/rendered', {parsedData, busStopsData, timingDiff});
                });
            });
        });
    }

}

module.exports = NearbyNWABsRouter;
