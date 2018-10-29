let DatabaseConnectionManager = require('../database/DatabaseConnectionManager');
let BusServiceRepository = require('../database/BusServiceRepository');
let BusServiceLister = require('./lib/BusServiceLister');
let config = require('./lta-config.json');

DatabaseConnectionManager.init();

let busServiceRepo = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
let busServiceLister = new BusServiceLister(config.accessKey);

let remaining = 0;
let completed = 0;

function getServiceNumber(service) {
    if (service.startsWith('NR')) {
        return service.replace(/[0-9]/g, '');
    } else if (service.startsWith('CT')) {
        return 'CT';
    } else
        return service.replace(/[A-Za-z#]/g, '');
}

function getServiceVariant(service) {
    if (service.startsWith('NR')) {
        return service.replace(/[A-Za-z#]/g, '');
    } else if (service.startsWith('CT')) {
        return service.replace(/CT/, '');
    } else
    return service.replace(/[0-9]/g, '').replace(/#/, 'C');
}


busServiceLister.getData(data => {

    data.forEach(busService => {

        let serviceData = {
            fullService: busService.ServiceNo,
            serviceNumber: getServiceNumber(busService.ServiceNo),
            variant: getServiceVariant(busService.ServiceNo),
            routeDirection: busService.Direction,

            routeType: busService.Category,
            operator: busService.Operator,
            interchanges: [
                busService.OriginCode,
                busService.DestinationCode
            ],

            frequency: {
                morning: {
                    min: busService.AM_Peak_Freq.split('-')[0],
                    max: busService.AM_Peak_Freq.split('-')[1]
                }, afternoon: {
                    min: busService.AM_Offpeak_Freq.split('-')[0],
                    max: busService.AM_Offpeak_Freq.split('-')[1]
                }, evening: {
                    min: busService.PM_Peak_Freq.split('-')[0],
                    max: busService.PM_Peak_Freq.split('-')[1]
                }, night: {
                    min: busService.PM_Offpeak_Freq.split('-')[0],
                    max: busService.PM_Offpeak_Freq.split('-')[1]
                }
            },

            loopPoint: busService.LoopDesc
        };

        let query = {fullService: busService.ServiceNo, routeDirection: busService.Direction};

        busServiceRepo.findOne(busService.ServiceNo, busService.Direction, (err, busService) => {
            if (!!busService) {
                remaining++;
                busServiceRepo.updateOne(query, serviceData, () => {
                    completed++;
                    console.log('updated ' + query.fullService, query.routeDirection);
                });
            } else {
                remaining++;
                busServiceRepo.create(serviceData, () => {
                    completed++;
                    console.log('saved ' + query.fullService, query.routeDirection);
                });
            }
        });

    });
});

setInterval(() => {
    if (remaining > 0 && remaining === completed)
        process.exit(0);
}, 500);
