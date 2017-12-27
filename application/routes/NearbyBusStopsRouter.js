const Router = require('./Router');
const BusStopsRepository = require('../../database/BusStopsRepository');
const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');

class NearbyBusStopsRouter extends Router {

    static init() {
        NearbyBusStopsRouter.busStops = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    }

    static index(req, res) {
        res.render('bus-stops/nearby');
    }

}

module.exports = NearbyBusStopsRouter;
