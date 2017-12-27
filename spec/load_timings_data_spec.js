const MockRepository = require('./MockRepository');
const BusTimingsUtils = require('../utils/BusTimingsUtils');

function createMockRepo(map) {
    var repo = new MockRepository();
    repo.setQueryResult(map);
    return repo;
}

var serviceRepo = createMockRepo({
    241: {
        "serviceNumber": "241",
        "variant": "",
        "fullService": "241",
        "routeType": "FEEDER",
        "operator": "SBS Transit",
        "interchanges": [
            "22009"
        ]
    },
    61: {
        "serviceNumber": "61",
        "variant": "",
        "fullService": "61",
        "routeType": "TRUNK",
        "operator": "SMRT Buses",
        "interchanges": [
            "43009",
            "82009"
        ]
    }
});

var stopsRepo = createMockRepo({
    22009: {
        busStopCode: '22009',
        busStopName: 'Boon Lay Int',
        position: {
            latitude: 0,
            longitude: 0
        },
        roadName: 'Jurong West Ctrl 3',
    }
});

var timings = [{
    "timings": [
        {
            "arrivalTime": new Date(),
            "isWAB": true,
            "load": 0,
            "busType": 2
        }
    ],
    "service": "241",
    "destination": "22009"
}];


describe('The bus timings utils class', () => {
    it('should allow one to load all the data for a given bus stop\'s timings', () => {
        expect(typeof timings[0].destination).toBe('string');
        BusTimingsUtils.loadDataForBusStopTimings(serviceRepo, stopsRepo, timings, (timings, serviceData) => {
            expect(typeof timings[0].destination).toBe('object');
            expect(serviceData).not.toBe(undefined);
            expect(serviceData[241].routeType).toBe('FEEDER');
        });
    });
});
