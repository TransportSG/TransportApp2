class BusServiceUtils {

    static getServiceNumber(service) {
    	if (service.startsWith('NR')) {
    		return service.replace(/[0-9]/g, '');
    	} else if (service.startsWith('CT')) {
    		return 'CT';
    	} else
    	return service.replace(/[A-Za-z#]/g, '');
    }

    static getServiceVariant(service) {
    	if (service.startsWith('NR')) {
    		return service.replace(/[A-Za-z#]/g, '');
    	} else if (service.startsWith('CT')) {
    		return service.replace(/CT/, '');
    	} else
    	return service.replace(/[0-9]/g, '').replace(/#/, 'C');
    }

    static getServiceType(service) {
        if (/^\d+N$/.test(service)) {
            return 'NIGHTOWL';
        }
        if (/^\d+[A-Za-z#]$/.test(service)) {
            return 'CHILD';
        }
        if (/^\d+$/.test(service)) {
            return 'PARENT';
        }
        if (/\^NR\d+$/.test(service)) {
            return 'NIGHTRIDER';
        }

        return 'UNKNOWN';
    }


    static lookupWithPromise(repository, service) {
        return new Promise((resolve, reject) => {
            repository.findOne(service, (err, data) => {
                resolve({service, data});
            });
        })
    }

    static loadServicesData(repository, services, callback) {
        var promises = [];
        for (var service of services) {
            promises.push(BusServiceUtils.lookupWithPromise(repository, service));
        }

        Promise.all(promises).then(data => {
            var serviceDataMap = {};
            var failedServices = [];
            var parentLookupTable = {};

            data.forEach((service, i) => {
                var serviceNumber = service.service;
                var serviceData = service.data;

                if (serviceData == null) {
                    if (BusServiceUtils.getServiceType(serviceNumber) === 'CHILD') {
                        var parent = BusServiceUtils.getServiceNumber(serviceNumber);
                        failedServices.push(BusServiceUtils.lookupWithPromise(repository, parent));
                        parentLookupTable[parent] = serviceNumber;
                        return;
                    } else {
                        serviceData = {
                            fullService: serviceNumber,
                            serviceNumber: BusServiceUtils.getServiceNumber(serviceNumber),
                            variant: BusServiceUtils.getServiceVariant(serviceNumber),
                            fake: true
                        }
                    }
                }

                serviceDataMap[serviceData.fullService] = serviceData;
            });

            Promise.all(failedServices).then(data => {
                data.forEach(service => {
                    var serviceData = service.data;
                    var serviceNumber = parentLookupTable[service.service];

                    serviceData = {
                        fullService: serviceNumber,
                        variant: BusServiceUtils.getServiceVariant(serviceNumber),
                        serviceNumber: service.service,
                        operator: serviceData.operator,
                        fake: true
                    }

                    serviceDataMap[serviceNumber] = serviceData;
                });

                setTimeout(callback.bind(null, serviceDataMap));
            });
        });
    }

}

module.exports = BusServiceUtils;
