const BusServiceUtils = require('./BusServiceUtils');

class BusTimingsUtils {

    static lookupWithPromise(repository, service) {
        return new Promise((resolve, reject) => {
            repository.findOne(service, (err, data) => {
                resolve(data);
            });
        })
    }

    static convertBSCToObject(repository, timings, callback) {
        var promises = [];
        var busStopMap = {};

        for (var service of timings) {
            if (typeof service.destination === 'string') {
                promises.push(BusTimingsUtils.lookupWithPromise(repository, service.destination).then(busStop => {
                    busStopMap[busStop.busStopCode] = busStop;
                    return true;
                }));
            }
        }

        Promise.all(promises).then(() => {
            callback(timings.map(service => {
                service.destination = busStopMap[service.destination] || service.destination;
                return service;
            }));
        });
    }

    static loadDataForBusStopTimings(busServiceRepo, busStopsRepo, timings, callback) {
        var services = timings.map(svc => svc.service).filter((svc, i, a) => a.indexOf(svc) === i);

        BusServiceUtils.loadServicesData(busServiceRepo, services, servicesData => {
            BusTimingsUtils.convertBSCToObject(busStopsRepo, timings, timings => {
                callback(timings, servicesData);
            });
        });
    }

}

module.exports = BusTimingsUtils;
