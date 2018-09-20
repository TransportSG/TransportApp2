const Router = require('./Router');
const BusStopsRepository = require('../../database/BusStopsRepository');
const BusServiceRepository = require('../../database/BusServiceRepository');
const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');

class BusServiceInfoRouter extends Router {

    static init() {
        BusServiceInfoRouter.busStops = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
        BusServiceInfoRouter.busServices = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    }

    static index(req, res) {
        let svc = req.params.svc;
        let dir = req.params.dir || 1;

        BusServiceInfoRouter.busServices.findOne(svc, dir, (err, service) => {
            res.render('bus-service-info/index', {
                service
            });
        });
    }
}

module.exports = BusServiceInfoRouter;
