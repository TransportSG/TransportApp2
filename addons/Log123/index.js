const Module = require('../../Module');
const BusTimings = require('../BusTimings/BusTimings');
const fs = require('fs');

class Log123 extends Module {

    static find() {
        let timingsCache = JSON.parse(JSON.stringify(BusTimings.getTimings()));

        let bmiTimings = timingsCache[10009];
        if (!bmiTimings) return;
        let timings123 = bmiTimings.filter(timing => timing.service == '123')[0];
        if (!timings123) return;

        timings123.timings.forEach(bus => {
            if (bus.busType === '2') {
                let curTime = new Date();
                let depDiff = Math.abs(new Date(bus.arrivalTime) - curTime) / 1000 / 60;
                if (depDiff < 0.6) {
                    fs.appendFile(__dirname + '/123-' + curTime.getDate() + '.txt', bus.arrivalTime + '\n', () => {});
                }
            }
        });
    }

    static init() {
        setInterval(Log123.find, 60 * 1000);
        setTimeout(Log123.find, 4000);
    }

}

module.exports = Log123;
