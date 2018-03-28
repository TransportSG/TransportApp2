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
                    possibleTimings[busStopCode] = busServiceTiming;
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

        let timingsCache = BusTimings.getTimings();

        let parsedData = BusSearcherRouter.parseData(req.body.query);
        let possibleSvcs = BusSearcherRouter.getSvcsFromInput(parsedData);

        let filteredServices = BusSearcherRouter.filterServices(timingsCache, possibleSvcs);

        let nwabFiltered = BusSearcherRouter.filterByNWAB(filteredServices, parsedData.wheelchair);

        console.log(JSON.stringify(nwabFiltered, null, 2));
        console.log(parsedData);
    }

}

module.exports = BusSearcherRouter;
