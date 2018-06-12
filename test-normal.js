const fs = require('fs');

function readData(cb) {
    fs.readFile('./data.json', (err, data) => {
        cb(JSON.parse(data.toString()));
    });
}

function writeData(data) {
    fs.writeFile('./data.json', JSON.stringify({data: data.slice(-7), last: +new Date()}), () => {});
}

function addServiceToday(data, svc) {
    let today = data[data.length-1];
    if (svc in today) return false;
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

let sd_daily = ['174', '157'];

readData(data => {
    if (new Date() - data.last > 86400000)
        data.push([]);

    let changed = sd_daily.map(svc => addServiceToday(data, svc)).filter(svc=>svc);
    if (changed.length) {
        writeData(data);
    }

    let freq = tabulateFrequency(data);
    sd_daily.forEach(svc => {
        console.log(svc, isCameo(freq, svc))
    });
});
