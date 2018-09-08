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
    if (!req.body.search) {
      res.status(400).json({
        error: 'No search provided'
      });
      return;
    }

    let search = req.body.search;
    if (!!search.match(/[^\w /-]/)) {
      res.status(400).json({
        error: 'Invalid search string'
      });
      return;
    }

    GeneralSearchRouter.busStops.find({
      $or: [
        {busStopCode: search},
        {busStopName: new RegExp(search, 'i')},
        {roadName: new RegExp(search, 'i')}
      ]
    }, (err, busStops) => {
      GeneralSearchRouter.busServices.find(search.toUpperCase(), (err, service) => {
        res.render('general-search/results', {
          busStops, service
        });
      });
    });
  }

}

module.exports = GeneralSearchRouter;
