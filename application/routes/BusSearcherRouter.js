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

        
    }

}

module.exports = BusSearcherRouter;
