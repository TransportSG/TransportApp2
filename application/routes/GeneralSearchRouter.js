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
    if (!!search.match(/[^\w \-\.\']/)) {
      res.status(400).json({
        error: 'Invalid search string'
      });
      return;
    }

    let query = {
        $or: [
            {busStopCode: search},
            {busStopName: new RegExp(search, 'i')}
        ]
    };

    if (search.length > 4) query['$or'].push({roadName: new RegExp(search, 'i')});

    GeneralSearchRouter.busStops.find(query, (err, busStops) => {

      let busStopsByNameLength = {};
      let finalBusStops = [];

      busStops = busStops.sort((a, b) => {
        return a.busStopName.length - b.busStopName.length;
      });

      busStops.forEach(busStop => {
        let length = busStop.busStopName.length;
        if (!busStopsByNameLength[length]) busStopsByNameLength[length] = [];
        busStopsByNameLength[length].push(busStop);
      })

      Object.keys(busStopsByNameLength).forEach(lengthID => {
        finalBusStops = finalBusStops.concat(busStopsByNameLength[lengthID].sort((a, b) => {
          let aNumbers = ((a.busStopName.match(/(\d+)/)||[0,0])[1]) * 1;
          let bNumbers = ((b.busStopName.match(/(\d+)/)||[0,0])[1]) * 1;

          return aNumbers - bNumbers;
        }));
      });

      busStops = finalBusStops;

      GeneralSearchRouter.busServices.findOne(new RegExp(search, 'i'), 1, (err, service) => {
        if (!!service) {

          GeneralSearchRouter.busServices.findOne(new RegExp(search, 'i'), 2, (err, service2) => {
              if (!service2) {
                  service2 = {interchanges: service.interchanges};
              }
              service = JSON.parse(JSON.stringify(service));
              let interchanges = [service.interchanges[0], service2.interchanges[0]];

              Promise.all(interchanges.map(busStopCode => {
                return GeneralSearchRouter.busStops.findWithPromise({busStopCode})
              })).then(data => {
                data = data.map(a=>a[0]);

                service.interchangeNames = [data[0].busStopName, data[1].busStopName];

                if (service.interchanges[0] == service.interchanges[1]) { // Loop svc
                  service.interchangeNames = [data[0].busStopName, service.loopPoint];
                }

                res.render('general-search/results', {
                  busStops, service
                });
            });
          });
        } else res.render('general-search/results', {
          busStops, service
        });
      });
    });
  }

}

module.exports = GeneralSearchRouter;
