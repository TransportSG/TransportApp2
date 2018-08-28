let fs = require('fs');

function readData(cb) {
    fs.readFile('./data.json', (err, data) => {
        let parsed = JSON.parse(data.toString());
        cb(parsed.data, parsed.last);
    });
}

function writeData(data) {
    fs.writeFile('./data.json', JSON.stringify({data: data.slice(-7), last: +new Date()}), () => {});
}

function addServiceToday(data, svc) {
    let today = data[data.length-1];
    if (today.includes(svc)) return false;
    today.push(svc);
    data[data.length-1] = today;
    return true;
}

function tabulateFrequency(data) {
    let frequency = {};
    data.forEach(day => {
        day.forEach(service => {
            if (!frequency[service]) frequency[service] = 0;
            frequency[service]++;
        });
    });

    return frequency;
}

function isCameo(freq, svc) {
    return !freq[svc] || freq[svc] < 5;
}

module.exports = {readData, writeData, addServiceToday, tabulateFrequency, isCameo}
