const nodemailer = require('nodemailer');
const Module = require('../../Module');
const BusSearcherRouter = require('../../application/routes/BusSearcherRouter');
const BusTimings = require('../BusTimings/BusTimings');

const config = require('./bus-email-config.json');
const depotData = require('../../application/routes/bus-depots.json');

let previousData = {
    svcsWithNWABs: [],
    svcsWithBendies: []
};

class BusEmailer extends Module {

    static getServiceList(timings) {
        let busStopTimings = Object.values(timings);
        let timingsList = busStopTimings.reduce((a, b) => a.concat(b), []);
        let flattened = timingsList.map(timing => timing.service);

        return flattened.filter((e, i, a) => a.indexOf(e) === i).sort();
    }

    static queryFunction() {
        let timingsCache = BusTimings.getTimings();

        let nwabBuses = BusSearcherRouter.filterByNWAB(timingsCache, 'nwab');
        let bendyBuses = BusSearcherRouter.filterByType(timingsCache, 'BD');

        let svcsWithNWABs = BusEmailer.getServiceList(nwabBuses);
        let svcsWithBendies = BusEmailer.getServiceList(bendyBuses);

        svcsWithNWABs = svcsWithNWABs.filter(svc => !svc.endsWith('M')).filter(svc =>
            !depotData.LYDEP.includes(parseInt(svc).toString()) && !depotData.BUDEP.includes(parseInt(svc).toString())
        );

        return {svcsWithNWABs, svcsWithBendies};
    }

    static initEmail() {
        BusEmailer.transporter = nodemailer.createTransport({
         service: config.service,
         auth: {
                user: config.username,
                pass: config.password
            }
        });
    }

    static sendMail(to, from, subject, html) {
        BusEmailer.transporter.sendMail({
            from, to, subject, html
        }, function (err, info) {
           if (err)
             console.log(err)
           else
             console.log(info);
        });
    }

    static init() {
        if (!config.active) {
            return;
        }

        console.log('BusEmailer started');
        BusEmailer.initEmail();

        setInterval(() => {
            let mailData = BusEmailer.queryFunction();

            let shouldUpdate = (mailData.svcsWithNWABs.join('') !== previousData.svcsWithNWABs.join('')) ||
                                (mailData.svcsWithBendies.join('') !== previousData.svcsWithBendies.join(''));

            previousData = mailData;

            if (shouldUpdate) {
                let emailBody =
`
<h1>Bus update as of ${new Date().toString()}</h1>

<p>Services with NWABS (Fake NWABs included): </p>
<code>${mailData.svcsWithNWABs.join(', ')}</code>
<br>
<br>

<p>Services with bendies (Wifi buses on 10 included): </p>
<code>${mailData.svcsWithBendies.join(', ')}</code>
`;

                config.subscribers.forEach(email => {
                    BusEmailer.sendMail(email, 'sbs9642p@gmail.com', 'Bus timing update', emailBody);

                    console.log('BusEmailer: sent mail to', email)
                });
            }
        }, 1000 * 60); // 1000ms = 1s; 1s * 60 = 1min;
    }

}

module.exports = BusEmailer;
