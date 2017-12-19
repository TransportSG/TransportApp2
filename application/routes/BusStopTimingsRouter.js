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
            res.end();
            return;
        }

        BusStopTimingsRouter.busStops.findOne(busStopCode, (err, busStop) => {
            if (!busStop) {
                res.end();
                return;
            }

            var timings = BusTimings.getTimings()[busStopCode] || [];
            var services = timings.map(svc => svc.service).filter((svc, i, a) => a.indexOf(svc) === i);

            BusTimingsUtils.loadServicesData(BusStopTimingsRouter.busServices, services, servicesData => {
                BusTimingsUtils.convertBSCToObject(BusStopTimingsRouter.busStops, timings, timings => {
                    res.render('bus/stop', {
                        busStopCode: busStopCode,
                        busStopName: busStop.busStopName,
                        timings: timings,
                        timingDiff: timingDiff,
                        busServiceData: servicesData
                    });
                });
            });
        });
    }
}

module.exports = BusStopTimingsRouter;
