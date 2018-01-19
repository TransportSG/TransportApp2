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

class BusStopTimingsRouter extends Router {

    static init() {
        BusStopTimingsRouter.busStops = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
        BusStopTimingsRouter.busServices = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    }

    static index(req, res) {
        var busStopCode = req.params.busStopCode;

        if (!busStopCode) {
            res.render('bus-stop-timings/invalid');
            return;
        }

        BusStopTimingsRouter.busStops.findOne(busStopCode, (err, busStop) => {
            if (!busStop) {
                res.render('bus-stop-timings/invalid');
                return;
            }

            var timings = BusTimings.getTimings()[busStopCode] || [];
            BusTimingsUtils.loadDataForBusStopTimings(BusStopTimingsRouter.busServices, BusStopTimingsRouter.busStops, timings, (timings, servicesData) => {
                res.render('bus-stop-timings/index', {
                    busStopCode: busStopCode,
                    busStopName: busStop.busStopName,
                    timings: timings,
                    timingDiff: timingDiff,
                    busServiceData: servicesData
                });
            });
        });
    }
}

module.exports = BusStopTimingsRouter;
