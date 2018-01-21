const MRTTimings = require('../../addons/MRTTimings/index');
const TimedCache = require('timed-cache');

var cache = new TimedCache({ defaultTtl: 60 * 1000 });

class MRTTimingsRouter {

    static index(req, res) {
        res.render('mrt-timings/index', {timings: []});
    }

    static renderTimings(req, res) {
        let stationName = req.params.station;
        if (!!cache.get(stationName)) {
            res.render('mrt-timings/index', {timings: cache.get(stationName)});
            return;
        }

        MRTTimings.getStationTimings(stationName, (err, timings) => {

            cache.put(stationName, timings);
            res.render('mrt-timings/index', {timings});
        });
    }

}

module.exports = MRTTimingsRouter;
