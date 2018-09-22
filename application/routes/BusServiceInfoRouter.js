const Router = require('./Router');
const BusStopsRepository = require('../../database/BusStopsRepository');
const BusServiceRepository = require('../../database/BusServiceRepository');
const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');
const BusTimings = require('../../addons/BusTimings/BusTimings');

var timingDiff = (a, b) => {
    var diff = new Date(Math.abs(a - b));
    return {
        minutes: diff.getUTCMinutes(),
        seconds: diff.getUTCSeconds(),
    }
};

class BusServiceInfoRouter extends Router {

    static init() {
        BusServiceInfoRouter.busStops = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
        BusServiceInfoRouter.busServices = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    }

    static index(req, res) {
        let svc = req.params.svc;
        let dir = req.params.dir || 1;

        BusServiceInfoRouter.busServices.findOne(svc, dir, (err, service) => {
            if (!service) {
                res.end('404');
                return;
            };

            Promise.all(service.interchanges.map(busStopCode => {
                return BusServiceInfoRouter.busStops.findWithPromise({busStopCode})
            })).then(data => {
                data = data.map(a=>a[0]);
                service.interchanges = data;

                let finalTimings = {};
                service.stops.forEach(busStop => {
                    let bsc = busStop.busStopCode;
                    let timings = BusTimings.getTimings()[bsc] || [];

                    let serviceTimings = timings.filter(t => t.service === svc)[0] || {timings: []};

                    finalTimings[bsc] = serviceTimings.timings.slice(0, 2);
                });

                res.render('bus-service-info/index', {
                    service,
                    timings: finalTimings,
                    timingDiff
                });
            });
        });
    };
}

module.exports = BusServiceInfoRouter;
