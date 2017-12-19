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

    findOne(service, callback) {
        if (this.serviceCache.has(service)) {
            callback(null, this.serviceCache.get(service));
            return;
        }

        this.BusServiceModel.findOne({
            fullService: service
        }, (err, busService) => {
            if (busService) {
                this.serviceCache.set(service, busService);
            }

            setTimeout(callback.bind(null, err, busService));
        });
    }

    find(service, callback) {
        this.findOne(service, callback);
    }

    create(data, callback) {
        throw new Error('Cannot create new bus service via repository!');
    }

    remove(query, callback) {
        throw new Error('Cannot remove bus service via repository!');
    }

    updateOne(query, data, callback) {
            throw new Error('Cannot update bus service via repository!');
    }

    updateAll(query, data, callback) {
        throw new Error('Cannot update bus service via repository!');
    }

}

module.exports = BusServiceRepository;
