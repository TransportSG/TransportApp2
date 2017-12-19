class BusTimingsUtils {

    static lookupWithPromise(repository, service) {
        return new Promise((resolve, reject) => {
            repository.findOne(service, (err, data) => {
                resolve(data);
            });
        })
    }

    static loadServicesData(repository, services, callback) {
        var promises = [];
        for (var service of services) {
            promises.push(BusTimingsUtils.lookupWithPromise(repository, service));
        }

        Promise.all(promises).then(data => {
            var serviceDataMap = {};

            for (var service of data) {
                serviceDataMap[service.fullService] = service;
            }
            setTimeout(callback.bind(null, serviceDataMap));
        });
    }

    static convertBSCToObject(repository, timings, callback) {
        var promises = [Promise.resolve()];
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

        BusTimingsUtils.loadServicesData(busServiceRepo, services, servicesData => {
            BusTimingsUtils.convertBSCToObject(busStopsRepo, timings, timings => {
                callback(timings, servicesData);
            });
        });
    }

}

module.exports = BusTimingsUtils;
