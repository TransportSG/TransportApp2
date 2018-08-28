const nodemailer = require('nodemailer');
const Module = require('../../Module');
const BusSearcherRouter = require('../../application/routes/BusSearcherRouter');
const BusTimings = require('../BusTimings/BusTimings');

const config = require('./bus-email-config.json');
const depotData = require('../../application/routes/bus-depots.json');

const cameoSorter = require('./cameo_sorter');

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

    static queryFunction(cb) {
        let timingsCache = JSON.parse(JSON.stringify(BusTimings.getTimings()));

        let nwabBuses = BusSearcherRouter.filterByNWAB(timingsCache, 'nwab');
        let bendyBuses = BusSearcherRouter.filterByType(timingsCache, 'BD');

        let svcsWithNWABs = BusEmailer.getServiceList(nwabBuses);
        let svcsWithBendies = BusEmailer.getServiceList(bendyBuses);

        svcsWithNWABs = svcsWithNWABs.filter(svc => !svc.endsWith('M')).filter(svc =>
            !depotData.LYDEP.includes(parseInt(svc).toString()) && !depotData.BUDEP.includes(parseInt(svc).toString())
        );

        let tridents = BusSearcherRouter.filterServices(
            BusSearcherRouter.filterByType(nwabBuses, 'DD'), BusSearcherRouter.getSvcsFromInput({depots: ['HGDEP']})
        );

        let SLBPDownsize = BusSearcherRouter.filterServices(
            BusSearcherRouter.filterByType(timingsCache, 'SD'), BusSearcherRouter.getSvcsFromInput({depots: ['SLBP']})
        );

        let BUDEPDownsize = BusSearcherRouter.filterServices(
            BusSearcherRouter.filterByType(timingsCache, 'SD'), BusSearcherRouter.getSvcsFromInput({services: ['78', '79', '98', '143']})
        );
        timingsCache = JSON.parse(JSON.stringify(BusTimings.getTimings()));

        let BUDEPUpsize = BusSearcherRouter.filterServices(
            BusSearcherRouter.filterByType(timingsCache, 'DD'), ['941', '947', '990']
        );

        tridents = BusEmailer.getServiceList(tridents);
        SLBPDownsize = BusEmailer.getServiceList(SLBPDownsize);

        let BUDEPFunfair = BusEmailer.getServiceList(BUDEPDownsize).concat(BusEmailer.getServiceList(BUDEPUpsize));

        cameoSorter.readData((data, last) => {
            if (+new Date() - last > 86400000)
                data.push([]);

            let changed = SLBPDownsize.map(svc => cameoSorter.addServiceToday(data, svc)).filter(svc=>svc);

            if (changed.length || +new Date() - last > 86400000) {
                cameoSorter.writeData(data);
            }

            let freq = cameoSorter.tabulateFrequency(data);
            let results = SLBPDownsize.filter(svc => cameoSorter.isCameo(freq, svc));
            cb({svcsWithNWABs, svcsWithBendies, tridents, SLBPDownsize: results, BUDEPFunfair});
        });
    }

    static getArrayDiff(oldArray, newArray) {
        let additions = [], subtractions = [];

        newArray.forEach(element => {
            if (!oldArray.includes(element)) {
                additions.push(element);
            }
        });

        oldArray.forEach(element => {
            if (!newArray.includes(element)) {
                subtractions.push(element);
            }
        });

        return {additions, subtractions}
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

        let run = () => {
            BusEmailer.queryFunction(mailData => {
                let shouldUpdate = (mailData.svcsWithNWABs.join('') !== previousData.svcsWithNWABs.join('')) ||
                                    (mailData.svcsWithBendies.join('') !== previousData.svcsWithBendies.join(''));

                if (shouldUpdate) {
                    let emailBody =
`
<h1>Bus update as of ${new Date().toString()}</h1>

<p>Trident Deployments</p>
<code>${mailData.tridents.join(', ')}</code>

${mailData.SLBPDownsize.length > 0 ? `<p>SL SD</p>
<code>${mailData.SLBPDownsize.join(', ')}</code>` : ''}

${mailData.BUDEPFunfair.length > 0 ? `<p>BUDEP Funfair</p>
<code>${mailData.BUDEPFunfair.join(', ')}</code>` : ''}

<p>Services with NWABS (Fake NWABs included): </p>
<code>${mailData.svcsWithNWABs.join(', ')}</code>
<p>Additions: <code>${BusEmailer.getArrayDiff(previousData.svcsWithNWABs, mailData.svcsWithNWABs).additions.join(', ')}</code></p>
<p>subtractions: <code>${BusEmailer.getArrayDiff(previousData.svcsWithNWABs, mailData.svcsWithNWABs).subtractions.join(', ')}</code></p>
<br>
<br>

<p>Services with bendies (Wifi buses on 10 included): </p>
<code>${mailData.svcsWithBendies.join(', ')}</code>
<p>Additions: <code>${BusEmailer.getArrayDiff(previousData.svcsWithBendies, mailData.svcsWithBendies).additions.join(', ')}</code></p>
<p>subtractions: <code>${BusEmailer.getArrayDiff(previousData.svcsWithBendies, mailData.svcsWithBendies).subtractions.join(', ')}</code></p>
`;

                    config.subscribers.forEach(email => {
                        BusEmailer.sendMail(email, 'sbs9642p@gmail.com', 'Bus timing update', emailBody);

                        console.log('BusEmailer: sent mail to', email)
                    });
                }

                previousData = mailData;
            });
        };

        setInterval(run, 1000 * 60 * 3); // 1000ms = 1s; 1s * 60 = 1min; 1min * 3 = 3min;
        setTimeout(run, 5000);
    }

}

module.exports = BusEmailer;
