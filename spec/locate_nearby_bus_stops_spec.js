const MockRepository = require('./MockRepository');
const BusStopsUtils = require('../utils/BusStopsUtils');

function createMockRepo(map, customFind) {
    var repo = new MockRepository(customFind);
    repo.setQueryResult(map);
    return repo;
}

var stopsRepo = createMockRepo({
    22009: {
        "busStopCode" : "22009",
        "roadName" : "Jurong West Ctrl 3",
        "busStopName" : "Boon Lay Int",
        "busServices" : [],
        "position" : {
            "latitude" : 1.33932334709184,
            "longitude" : 103.70545701843297
        }
    },
    44009: {
        "busStopCode" : "44009",
        "roadName" : "Choa Chu Kang Loop",
        "busStopName" : "Choa Chu Kang Int",
        "busServices" : [],
        "position" : {
            "latitude" : 1.38551052071341,
            "longitude" : 103.74407583750003
        },

    }
});

describe('the bus stop locator', () => {
    it('should locate nearby bus stops', () => {

    });
});
