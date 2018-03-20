const Repository = require('./Repository');
const BusServiceSchema = require('./BusServiceSchema');
const TimedHashMap = require('./TimedHashMap');

class BusServiceRepository extends Repository {

    constructor(databaseConnection) {
        super();

        this.databaseConnection = databaseConnection;
        this.serviceCache = new TimedHashMap(1000 * 60 * 60 * 3); // 1000ms * 60 * 60 * 3 = 1min * 60 * 3 = 1hr * 3 = 3hr

        this.BusServiceModel = databaseConnection.model('BusService', BusServiceSchema);
    }

    findOne(service, direction, callback) {
        if (!callback) {
            callback = direction;
            direction = 1;
        }
        if (this.serviceCache.has(service + '.' + direction)) {
            callback(null, this.serviceCache.get(service + '.' + direction));
            return;
        }

        this.BusServiceModel.findOne({
            fullService: service,
            routeDirection: direction
        }, (err, busService) => {
            if (busService) {
                this.serviceCache.set(service + '.' + direction, busService);
            }

            setTimeout(callback.bind(null, err, busService));
        });
    }

    find(service, callback) {
        this.findOne(service, callback);
    }

    create(data, callback) {
        new this.BusServiceModel(data).save(callback);
    }

    remove(query, callback) {
        this.BusServiceModel.remove(query, callback);
    }

    updateOne(query, data, callback) {
        this.BusServiceModel.findOneAndUpdate(query, {$set: {data}}, {}, callback);
    }

    updateAll(query, data, callback) {
        throw new Error('Cannot update all!');
    }

}

module.exports = BusServiceRepository;
