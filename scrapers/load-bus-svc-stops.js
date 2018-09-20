let DatabaseConnectionManager = require('../database/DatabaseConnectionManager');
let BusServiceRepository = require('../database/BusServiceRepository');
let BusStopsRepository = require('../database/BusStopsRepository');
let BusServiceRouteLister = require('./lib/BusServiceRouteLister');
let config = require('./lta-config.json');

DatabaseConnectionManager.init();

let busServiceRepo = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
let busStopsRepo = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));

let busServiceRouteLister = new BusServiceRouteLister(config.accessKey);

busServiceRouteLister.getData(data => {
    let services = Object.keys(data);
    services.forEach(serviceNo => {
        let svcData = data[serviceNo];
        Object.keys(svcData).forEach(dir => {
            let dirStops = svcData[dir];

            console.log(serviceNo + ' dir ' + dir + ' ' + dirStops.length + ' stops');
            busServiceRepo.findOne(serviceNo, dir, (err, svc) => {
                svc.stops = dirStops;
                svc.save(() => {console.log('saved ' + serviceNo + 'D' + dir)});
            });
        });
    })
});
