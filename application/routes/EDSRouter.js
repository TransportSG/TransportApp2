const Router = require('./Router');
const BusServiceRepository = require('../../database/BusServiceRepository');
const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');

class EDSRouter extends Router {

    static init() {
        EDSRouter.busServices = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    }


    static svc(req, res) {
        let svc = req.params.svc;
        if (!svc) {res.end(400); return;}
        EDSRouter.busServices.findOne(svc, (err, svc) => {
            res.json(svc);
            res.end();
        })

    }

}

module.exports = EDSRouter;
