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
            var ints = {};

            svc.interchanges.forEach((int, i) => {
                promises.push(new Promise((a, r) => {
                    EDSRouter.busStops.findOne(int, (err, intStop) => {
                        if (intStop)
                            ints[i] = intStop.busStopName;
                        else
                            ints[i] = int;
                        a();
                    });
                }));
            });

            Promise.all(promises).then(() => {
                res.json({
                    operator: svc.operator,
                    routeType: svc.routeType,
                    interchanges: [ints[0], ints[1]].filter(Boolean).filter(int => !(int.toLowerCase().includes('blk')))
                });
                res.end();
            });
        })

    }

}

module.exports = EDSRouter;
