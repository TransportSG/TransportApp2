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
        res.header('Access-Control-Allow-Origin', '*');

        if (!svc) {res.end('error!'); return;}
        EDSRouter.busServices.findOne(svc, (err, svc) => {
            if (!svc) {res.end('error!'); return;}
            var promises = [];
            var ints = [];

            svc.interchanges.forEach(int => {
                promises.push(new Promise((a, r) => {
                    EDSRouter.busStops.findOne(int, (err, intStop) => {
                        if (intStop)
                            ints.push(intStop.busStopName);
                        else
                            ints.push(int);
                        a();
                    });
                }));
            });

            Promise.all(promises).then(() => {
                svc.interchanges = ints;


                res.json(svc);
                res.end();
            });
        })

    }

}

module.exports = EDSRouter;
