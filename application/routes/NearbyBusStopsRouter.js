const Router = require('./Router');
const BusStopsRepository = require('../../database/BusStopsRepository');
const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');

var distanceBetween2Coords = (lat1, lon1, lat2, lon2) => {
    var p = 0.017453292519943295;
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 +
    c(lat1 * p) * c(lat2 * p) *
    (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a));
}

class NearbyBusStopsRouter extends Router {

    static init() {
        NearbyBusStopsRouter.busStops = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    }

    static index(req, res) {
        res.render('bus-stops-nearby/index');
    }

    static geoSearch(req, res) {
        let lat = req.query.lat * 1;
        let long = req.query.long * 1;

        NearbyBusStopsRouter.busStops.locateNearby(lat, long, 0.00667, (err, busStops) => {
            res.render('bus-stops-nearby/rendered', {
                busStops: busStops.map(busStop => {
                    busStop.distance = distanceBetween2Coords(lat, long, busStop.position.latitude, busStop.position.longitude);
                    return busStop;
                }).sort((a, b) => a.distance - b.distance)
            });
        });
    }

}

module.exports = NearbyBusStopsRouter;
