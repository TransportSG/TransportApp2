let DatabaseConnectionManager = require('../database/DatabaseConnectionManager');
let BusStopsRepository = require('../database/BusStopsRepository');
let BusStopsLister = require('./lib/BusStopsLister');
let config = require('./lta-config.json');

DatabaseConnectionManager.init();

let busStopsRepo = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
let busStopsLister = new BusStopsLister(config.accessKey);

let completed = 0;
let remaining = 0;

busStopsLister.getData(data => {

    let completedBusStops = [];

    data.forEach(busStop => {

        let busStopData = {
            busStopCode: busStop.BusStopCode,
            busStopName: busStop.Description,
            position: {
                latitude: busStop.Latitude,
                longitude: busStop.Longitude
            },
            roadName: busStop.RoadName,
        };

        let query = {busStopCode: busStop.BusStopCode};

        busStopsRepo.findOne(query.busStopCode, (err, busStop) => {
            if (completedBusStops.includes(query.busStopCode)) return;
            completedBusStops.push(query.busStopCode);

            remaining++;
            if (!!busStop) {
                busStopsRepo.updateOne(query, busStopData, () => {
                    completed++;
                    console.log('updated ' + query.busStopCode);
                });
            } else {
                busStopsRepo.create(busStopData, () => {
                    completed++;
                    console.log('saved ' + query.busStopCode)
                });
            }
        });

    });
});

setInterval(() => {
    if (remaining > 0 && remaining === completed)
        process.exit(0);
}, 500);
