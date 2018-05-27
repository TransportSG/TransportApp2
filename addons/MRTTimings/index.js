const request = require('request'),
JSDOM = require('jsdom').JSDOM,
support = require('./support.json');

class MRTTimings {

    static getTimingsDocument(stationCode, callback) {
        if (!Object.values(support.stations).includes(stationCode)) {
            setTimeout(callback.bind(null, 'No such station!', null), 0);
            return;
        }

        request.post({
            url: support.url,
            body: support.data + stationCode,
            headers: support.headers
        }, (err, response, body) => {
            var parts = body.split('|');
            var document = new JSDOM(parts[3]).window.document;

            setTimeout(callback.bind(null, null, document));
        });
    }

    static extractMainContent(document) {
        var directions = document.querySelectorAll('[style="display:inline-block;color:Black;font-weight:bold;width:392px;"]');
        var timingsDivs = document.querySelectorAll('[style="display:inline-block;color:Black;font-weight:bold;width:392px;"] ~ div');

        var result = [];

        timingsDivs.forEach((timing, i) => {
            if (directions[i].textContent.trim() === '') return;
            var line = directions[i].textContent.split(' ')[1];

            var timingRow = timing.querySelectorAll('tr:nth-child(2) > td');
            var directionRow = timing.querySelectorAll('tr:nth-child(3) > td');

            result.push({
                timingRow, directionRow, line
            });
        });

        return result;
    }

    static parseContents(contents, stationName) {
        var timingInfo = [];

        contents.forEach(data => {
            let trainLine = data.line;
            let timingSet = Array.prototype.map.call(data.timingRow, (trainTiming, i) => {
                let rawTiming = trainTiming.textContent;
                let destination = data.directionRow[i].textContent;

                if (rawTiming === 'N/A') return null;
                if (destination === 'Do not board') return null;

                // FIX: Page reports CCL trains at CDBG to terminate at CDBG, not CHBF
                if (stationName === 'Dhoby Ghaut' && trainLine === 'CCL') destination = 'HarbourFront';

                let parsedTiming = rawTiming.match(/(\d+)/)[0];
                if (parsedTiming === '1') parsedTiming = 'Arr';

                return {
                    trainLine, destination,
                    timeToArrival: parsedTiming
                }
            });

            timingSet.filter(Boolean).filter((timing, i, a) => {
                var foundIndex = -1;
                for (var j = 0; j < a.length; j++) {
                    if (a[j].timeToArrival === timing.timeToArrival) {
                        if (foundIndex === j) return false;
                        foundIndex = i;
                    }
                }
                return true;
            }).forEach(timing => timingInfo.push(timing));
        });



        let trainTimings = {};

        timingInfo.forEach(timing => {
            let line = timing.trainLine;
            let destination = timing.destination;
            if (!(line in trainTimings)) trainTimings[line] = {};
            if (!(destination in trainTimings[line])) trainTimings[line][destination] = [];

            trainTimings[line][destination].push(timing.timeToArrival);
        });

        console.log(JSON.stringify(trainTimings));

        return trainTimings;
    }

    static getStationTimings(stationName, callback) {
        MRTTimings.getTimingsDocument(support.stations[stationName], (err, document) => {
            if (err) {
                setTimeout(callback.bind(null, err, null));
                return;
            }
            var contents = MRTTimings.extractMainContent(document);
            var parsed = MRTTimings.parseContents(contents, stationName);

            setTimeout(callback.bind(null, null, parsed));
        });
    }
}

module.exports = MRTTimings;
