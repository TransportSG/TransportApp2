const Repository = require('./Repository');
const BusStopSchema = require('./BusStopSchema');
const TimedHashMap = require('./TimedHashMap');

class BusStopsRepository extends Repository {

    constructor(databaseConnection) {
        super();

        this.databaseConnection = databaseConnection;
        this.stopsCache = new TimedHashMap(1000 * 60 * 60 * 3); // 1000ms * 60 * 60 * 3 = 1min * 60 * 3 = 1hr * 3 = 3hr

        this.BusStopsModel = databaseConnection.model('BusStops', BusStopSchema);
    }

    findOne(busStopCode, callback) {
        if (this.stopsCache.has(busStopCode)) {
            setTimeout(callback.bind(null, null, this.stopsCache.get(busStopCode)));
            return;
        }

        this.BusStopsModel.findOne({
            busStopCode: busStopCode
        }, (err, busStops) => {
            if (busStops) {
                this.stopsCache.set(busStopCode, busStops);
            }
            setTimeout(callback.bind(null, err, busStops));
        });
    }

    find(query, callback) {
        this.BusStopsModel.find(query, (err, busStops) => {
            setTimeout(callback.bind(null, err, busStops));
        });
    }

    findWithPromise(query) {
      return this.BusStopsModel.find(query);
    }

    create(data, callback) {
        new this.BusStopsModel(data).save(callback);
    }

    remove(query, callback) {
        this.BusStopsModel.remove(query, callback);
    }

    updateOne(query, data, callback) {
        this.BusStopsModel.findOneAndUpdate(query, {$set: data}, {}, callback);
    }

    updateAll(query, data, callback) {
        throw new Error('Cannot update all!');
    }

    locateNearby(latitude, longitude, range, callback) {
        this.BusStopsModel.find({
            'position.latitude': {
                $gt: latitude - range,
                $lt: latitude + range
            },
            'position.longitude': {
                $gt: longitude - range,
                $lt: longitude + range
            }
        }, callback);
    }

}

module.exports = BusStopsRepository;
