const Router = require('./Router');
const BusTimings = require('../../addons/BusTimings/BusTimings');
const BusStopsRepository = require('../../database/BusStopsRepository');
const BusServiceRepository = require('../../database/BusServiceRepository');
const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');
const BusTimingsUtils = require('../../utils/BusTimingsUtils');

class BusSearcherRouter extends Router {

    static init() {
        BusSearcherRouter.busStops = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
        BusSearcherRouter.busServices = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    }

    static index(req, res) {
    	res.render('bus-searcher/index.pug');
    }

}

module.exports = BusSearcherRouter;
