const Module = require('../../Module');
const BusTimings = require('../BusTimings/BusTimings');
const fs = require('fs');

class Log123 extends Module {

    static find() {
        let timingsCache = JSON.parse(JSON.stringify(BusTimings.getTimings()));

        let bmiTimings = timingsCache[10009];
        if (!bmiTimings) return;
        let timings123 = bmiTimings.filter(timing => timing.service == '123');
        if (!timings123) return;

        timings123.forEach(bus => {
            if (bus.type == 2) {
                let curTime = new Date();
                let depDiff = Math.abs(bus.arrivalTime - curTime);
                if (depDiff > 60 * 1000) {
                    fs.appendFile('123.txt', depTime + '\n', () => {});
                }
            }
        });
    }

    static init() {
        setInterval(Log123.find, 60 * 1000);
    }

}

module.exports = Log123;
