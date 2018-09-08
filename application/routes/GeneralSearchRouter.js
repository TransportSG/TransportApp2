const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');
const BusStopsRepository = require('../../database/BusStopsRepository');
const BusServiceRepository = require('../../database/BusServiceRepository');
const MRTStations = require('../../addons/MRTTimings/mrt-stations.json');

class GeneralSearchRouter {

  static init() {
    GeneralSearchRouter.busStops = new BusStopsRepository(DatabaseConnectionManager.getConnection('TransportApp'));
    GeneralSearchRouter.busServices = new BusServiceRepository(DatabaseConnectionManager.getConnection('TransportApp'));
  }

  static renderMain(req, res) {
    res.render('general-search/index');
  }

  static search(req, res) {
    
  }

}

module.exports = GeneralSearchRouter;
