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
            res.render('mrt-timings/index', {timings: cache.get(stationName), stationName});
            return;
        }

        MRTTimings.getStationTimings(stationName, (err, timings) => {
            if (err) {
                res.status(400).end(err);
                return;
            }

            cache.put(stationName, timings);

            res.render('mrt-timings/index', {timings, stationName});
        });
    }

}

module.exports = MRTTimingsRouter;
