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

    find(busStopCode, callback) {
        this.findOne(busStopCode, callback);
    }

    create(data, callback) {
        throw new Error('Cannot create new bus stop via repository!');
    }

    remove(query, callback) {
        throw new Error('Cannot remove bus stops via repository!');
    }

    updateOne(query, data, callback) {
            throw new Error('Cannot update bus stops via repository!');
    }

    updateAll(query, data, callback) {
        throw new Error('Cannot update bus stops via repository!');
    }

}

module.exports = BusStopsRepository;
