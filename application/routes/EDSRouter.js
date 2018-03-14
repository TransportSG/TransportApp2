const Router = require('./Router');
const BusServiceRepository = require('../../database/BusServiceRepository');
const BusStopsRepository = require('../../database/BusStopsRepository');
const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');

class EDSRouter extends Router {

    static init() {
        EDSRouter.busServices = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
        EDSRouter.busStops = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    }


    static svc(req, res) {
        let svc = req.params.svc;
        if (!svc) {res.end(400); return;}
        EDSRouter.busServices.findOne(svc, (err, svc) => {
            var promises = [];
            var ints = [];

            svc.interchanges.forEach(int => {
                promises.push(new Promise((a, r) => {
                    EDSRouter.busStops.findOne(int, (err, intStop) => {
                        ints.push(intStop.busStopName);
                        a();
                    });
                }));
            });

            Promise.all(promises).then(() => {
                svc.interchanges = ints;

                res.header('Access-Control-Allow-Origin', '*');

                res.json(svc);
                res.end();
            });
        })

    }

}

module.exports = EDSRouter;
