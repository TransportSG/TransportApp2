let DatabaseConnectionManager = require('../database/DatabaseConnectionManager');
let BusServiceRepository = require('../database/BusServiceRepository');
let BusStopsRepository = require('../database/BusStopsRepository');
let BusServiceRouteLister = require('./lib/BusServiceRouteLister');
let config = require('./lta-config.json');

DatabaseConnectionManager.init();

let busServiceRepo = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'), false);
let busStopsRepo = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'), false);

let busServiceRouteLister = new BusServiceRouteLister(config.accessKey);

let remaining = 0;
let completed = 0;

busServiceRouteLister.getData(data => {
    let services = Object.keys(data);
    services.forEach(serviceNo => {
        let svcData = data[serviceNo];
        Object.keys(svcData).forEach(dir => {
            let dirStops = svcData[dir];

            dirStops = dirStops.filter(busStop => !isNaN(parseInt(busStop.busStopCode)));

            console.log(serviceNo + ' dir ' + dir + ' ' + dirStops.length + ' stops');
            busServiceRepo.findOne(serviceNo, dir, (err, svc) => {

                let promises = [];
                let finalBusStops = [];

                dirStops.forEach(busStop => {
                    promises.push(busStopsRepo.findWithPromise({
                        busStopCode: busStop.busStopCode
                    }).then(busStopData => {
                        busStopData = busStopData[0];
                        finalBusStops[busStop.stopNumber] = {
                            busStopCode: busStopData.busStopCode,
                            busStopName: busStopData.busStopName,
                            roadName: busStopData.roadName,
                            distance: busStop.distance,
                            stopNumber: busStop.stopNumber,
                            firstBus: busStop.firstBus,
                            lastBus: busStop.lastBus
                        };
                    }));
                });

                Promise.all(promises).then(() => {
                    svc.stops = finalBusStops.filter(b => !!b);
                    remaining++;
                    svc.save(e => {completed++; if (!e) {console.log('saved ' + serviceNo + 'D' + dir)} else {console.log(e)}});
                });
            });
        });
    })
});

setInterval(() => {
    if (remaining > 0 && remaining === completed)
        process.exit(0);
}, 500);
