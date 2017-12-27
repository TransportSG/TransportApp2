class BusStopsUtils {

    static getNearbyBusStops(busStopsRepo, lat, long, callback) {
        busStopsRepo.customFind({})
        .where('position.latitude').gt(lat - 0.006).lt(lat + 0.006)
        .where('position.longitude').gt(long - 0.006).lt(long + 0.006)
        .exec((err, busStops) => {
            console.log(busStops);
        });
    }

}

module.exports = BusStopsUtils;
