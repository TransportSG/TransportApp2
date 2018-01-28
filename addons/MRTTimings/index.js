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
            var finalData = {
                trainLine: data.line,
                timings: Array.prototype.map.call(data.timingRow, (trainTiming, i) => {
                    if (trainTiming.textContent === 'N/A') return null;
                    if (stationName === 'Dhoby Ghaut' && data.line === 'CCL') data.directionRow[i].textContent = 'HarbourFront';
                    if (data.directionRow[i].textContent === 'Do not board') return null;
                    if (data.directionRow[i].textContent === 'HabourFront') data.directionRow[i].textContent = 'HarbourFront';

                    return {
                        destination: data.directionRow[i].textContent,
                        timeToArrival: trainTiming.textContent.match(/(\d+)/)[0]
                    };
                }).filter(Boolean).sort((a, b) => a.timeToArrival - b.timeToArrival).filter((e, i, a) => {
                    var foundIndex = -1;
                    for (var j = 0; j < a.length; j++) {
                        if (a[j].timeToArrival === e.timeToArrival) {
                            if (foundIndex === j) return false;
                            foundIndex = i;
                        }
                    }
                    return true;
                })
            };
            if (finalData.timings.length > 0)
                timingInfo.push(finalData);
        });

        return timingInfo;
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
