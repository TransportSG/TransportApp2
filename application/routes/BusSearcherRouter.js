const Router = require('./Router');
const BusTimings = require('../../addons/BusTimings/BusTimings');
const BusStopsRepository = require('../../database/BusStopsRepository');
const BusServiceRepository = require('../../database/BusServiceRepository');
const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');
const TextParser = require('../../addons/SimpleEnglishParser/index');
const BusTimingsUtils = require('../../utils/BusTimingsUtils');

const BusDepotData = require('./bus-depots.json');

function objectType(object) {
    return Object.prototype.toString.call(object).match(/\[object (\w+)\]/)[1];
}

class BusSearcherRouter extends Router {

    static init() {
        BusSearcherRouter.busStops = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
        BusSearcherRouter.busServices = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    }

    static index(req, res) {
    	res.render('bus-searcher/index.pug');
    }

    static search(req, res) {
        if (!req.body.query) {
            res.status(400).json({
                error: 'No query provided!'
            });
            return;
        }

        var timingsCache = BusTimings.getTimings();

        var parsed = TextParser.parse(req.body.query, {
            services: {
                type: /(!?\d+[GWABC#M]?)/,
                canRepeat: true
            },
            wheelchair: ['wab', 'nwab'],
            type: ['SD', 'DD', 'BD'],
            depots: {
                type: ['SLBP', 'ARBP', 'BBDEP', 'HGDEP', 'BNDEP', 'AMDEP', 'KJDEP', 'WLDEP'],
                canRepeat: true
            }
        });

        var possibleTimings = {};

        parsed.services = parsed.services || [];
        parsed.depots = parsed.depots || [];

        if (!parsed.services.length && !parsed.depots.length) {
            res.end('Need to specify at least service or depot!');
            return;
        }

        for (var depot of parsed.depots) {
            parsed.services = parsed.services.concat(BusDepotData[depot]);
        }

        for (var service of parsed.services.filter(svc => svc.startsWith('!'))) {
            console.log('removing ' + service.substring(1))
            parsed.services.splice(parsed.services.indexOf(service.substring(1)), 1);
            parsed.services.splice(parsed.services.indexOf(service), 1);
        }

        for (var service of parsed.services) {
            for (var busStopCode of Object.keys(timingsCache)) {
                var busStop = timingsCache[busStopCode];
                var busStopServices = busStop.map(svc => svc.service);

                if (busStopServices.includes(service.toString())) {
                    if (!possibleTimings[busStopCode]) possibleTimings[busStopCode] = {};
                    possibleTimings[busStopCode][service] = timingsCache[busStopCode].filter(svc => svc.service === service);
                }
            }
        }

        function filter(filter) {
            for (var busStopCode of Object.keys(possibleTimings)) {
                var busStop = possibleTimings[busStopCode];
                for (var service of Object.keys(busStop)) {
                    var filtered = busStop[service].filter(filter);
                    possibleTimings[busStopCode][service] = filtered;

                    if (filtered.length === 0) {
                        delete possibleTimings[busStopCode][service];
                    }
                }
                if (Object.keys(possibleTimings[busStopCode]).length === 0) {
                    delete possibleTimings[busStopCode];
                }
            }
        }

        if (objectType(parsed.wheelchair) === 'String') {
            var wabFilterType = parsed.wheelchair === 'wab';
            filter(bus => bus.isWAB == wabFilterType);
        }

        if (objectType(parsed.type) === 'String') {
            var busTypeMapping = ['', 'SD', 'DD', 'BD'];

            filter(bus => busTypeMapping[bus.busType] === parsed.type);
        }

        var promises = [];
        var serviceData = {};
        var busStops = {};

        Object.keys(possibleTimings).forEach(busStopCode => {
            promises.push(new Promise((resolve, reject) => {
                let busStopTimings = possibleTimings[busStopCode];
                let timings = [];

                Object.keys(busStopTimings).forEach(svc => timings = timings.concat(busStopTimings[svc]));

                BusTimingsUtils.loadDataForBusStopTimings(BusSearcherRouter.busServices, BusSearcherRouter.busStops, timings, (newTimings, servicesData) => {
                    possibleTimings[busStopCode] = newTimings;
                    BusSearcherRouter.busStops.findOne(busStopCode, (err, busStop) => {
                        busStops[busStopCode] = busStop;
                        resolve();
                    });
                });
            }));
        });

        var timingDiff = (a, b) => {
            var diff = new Date(Math.abs(a - b));
            return {
                minutes: diff.getUTCMinutes(),
                seconds: diff.getUTCSeconds(),
            }
        };

        Promise.all(promises).then(() => {
            res.render('bus-searcher/results.pug', {
                busStops,
                timingDiff,
                possibleTimings
            })
        });
    }

}

module.exports = BusSearcherRouter;
