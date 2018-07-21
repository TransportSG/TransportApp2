const Router = require('./Router');
const BusTimings = require('../../addons/BusTimings/BusTimings');
const BusStopsRepository = require('../../database/BusStopsRepository');
const BusServiceRepository = require('../../database/BusServiceRepository');
const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');
const TextParser = require('../../addons/SimpleEnglishParser/index');
const BusTimingsUtils = require('../../utils/BusTimingsUtils');
const NearbyNWABsRouter = require('./NearbyNWABsRouter');

const BusDepotData = require('./bus-depots.json');

function objectType(object) {
    return Object.prototype.toString.call(object).match(/\[object (\w+)\]/)[1];
}

var timingDiff = (a, b) => {
    var diff = new Date(Math.abs(a - b));
    return {
        minutes: diff.getUTCMinutes(),
        seconds: diff.getUTCSeconds(),
    }
};

class BusSearcherRouter extends Router {

    static init() {
        BusSearcherRouter.busStops = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
        BusSearcherRouter.busServices = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    }

    static index(req, res) {
    	res.render('bus-searcher/index.pug');
    }

    static getSvcsFromInput(parsedData) {
        let possibleSvcs = [];

        possibleSvcs = possibleSvcs.concat(parsedData.services);

        if (parsedData.depots)
            parsedData.depots.forEach(depot => {
                let svcsInDepot = BusDepotData[depot];
                possibleSvcs = possibleSvcs.concat(svcsInDepot);
            });

        return possibleSvcs;
    }

    static parseData(query) {
        return TextParser.parse(query, {
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

    }

    static filterServices(timings, svcList) {
        let possibleTimings = {};
        let busStopCodes = Object.keys(timings);

        busStopCodes.forEach(busStopCode => {
            let busStopTimings = timings[busStopCode];

            let filteredSvcs = busStopTimings.filter(busServiceTiming => {
                return svcList.includes(busServiceTiming.service);
            });

            if (filteredSvcs.length > 0) {
                possibleTimings[busStopCode] = filteredSvcs;
            }
        });

        return possibleTimings;
    }

    static filterByNWAB(timings, wheelchair) {
        let possibleTimings = {};
        let busStopCodes = Object.keys(timings);

        busStopCodes.forEach(busStopCode => {
            let busStopTimings = timings[busStopCode];

            busStopTimings.forEach(busServiceTiming => {
                let matchingTimings = busServiceTiming.timings.filter(bus => {
                return !!wheelchair ? (wheelchair === (bus.isWAB ? 'wab' : 'nwab')) : true
            });

                if (matchingTimings.length > 0) {
                    busServiceTiming.timings = matchingTimings;
                    if (!possibleTimings[busStopCode]) possibleTimings[busStopCode] = [];
                    possibleTimings[busStopCode].push(busServiceTiming);
                }
            });
        });

        return possibleTimings;
    }

    static filterByType(timings, type) {
        let possibleTimings = {};
        let busStopCodes = Object.keys(timings);
        let typeMap = [0, 'SD', 'DD', 'BD'];

        busStopCodes.forEach(busStopCode => {
            let busStopTimings = timings[busStopCode];

            busStopTimings.forEach(busServiceTiming => {
                let matchingTimings = busServiceTiming.timings.filter(bus => {

                return !!type ? typeMap[bus.busType] === type : true;
            });

                if (matchingTimings.length > 0) {
                    busServiceTiming.timings = matchingTimings;
                    if (!possibleTimings[busStopCode]) possibleTimings[busStopCode] = [];
                    possibleTimings[busStopCode].push(busServiceTiming);
                }
            });
        });

        return possibleTimings;
    }

    static search(req, res) {
        if (!req.body.query) {
            res.status(400).json({
                error: 'No query provided!'
            });
            return;
        }

        let timingsCache = JSON.parse(JSON.stringify(BusTimings.getTimings()));

        let parsedData = BusSearcherRouter.parseData(req.body.query);
        let possibleSvcs = BusSearcherRouter.getSvcsFromInput(parsedData);

        let filteredServices = BusSearcherRouter.filterServices(timingsCache, possibleSvcs);

        let nwabFiltered = BusSearcherRouter.filterByNWAB(filteredServices, parsedData.wheelchair);
        let typeFiltered = BusSearcherRouter.filterByType(nwabFiltered, parsedData.type);

        NearbyNWABsRouter.getDataForAllBusTimings(typeFiltered, parsedData => {
            NearbyNWABsRouter.getDataForAllBusStops(Object.keys(typeFiltered), busStopsData => {
                res.render('nearby-nwabs/rendered', {parsedData, busStopsData, timingDiff});
            });
        });
    }

}

module.exports = BusSearcherRouter;
