const Module = require('../Module');
const http = require('http');
const https = require('https');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const FunctionUtils = require('../utils/FunctionUtils');

const IndexRouter = require('../application/routes/IndexRouter');
const BusStopTimingsRouter = require('../application/routes/BusStopTimingsRouter');
const NearbyBusStopsRouter = require('../application/routes/NearbyBusStopsRouter');
const FunRouter = require('../application/routes/FunRouter');
const MRTTimingsRouter = require('../application/routes/MRTTimingsRouter');
const NearbyNWABsRouter = require('../application/routes/NearbyNWABsRouter');
const EDSRouter = require('../application/routes/EDSRouter');
const BusSearcherRouter = require('../application/routes/BusSearcherRouter');
const BusMatcherRouter = require('../application/routes/BusMatcherRouter');
const GeneralSearchRouter = require('../application/routes/GeneralSearchRouter');
const BusServiceInfoRouter = require('../application/routes/BusServiceInfoRouter');

const serverConfig = require('./server-config.json');

class MainServer extends Module {

    constructor() {

    }

    static init() {

        MainServer.expressApp = express();

        MainServer.configureMiddleware(MainServer.expressApp);
        MainServer.configureRoutes(MainServer.expressApp);

        MainServer.initServer(MainServer.expressApp);
    }

    static initServer(expressApp) {
        var protocol = serverConfig.httpsEnabled ? https : http;
        var port = serverConfig.httpsEnabled ? serverConfig.httpsPort : serverConfig.httpPort;

        var createServer = FunctionUtils.bindArgsAsArray(protocol.createServer, serverConfig.httpsEnabled ? [{
            key: fs.readFileSync('https/privkey.pem'),
            cert: fs.readFileSync('https/cert.pem'),
            ca: fs.readFileSync('https/chain.pem')
        }, expressApp] : [expressApp]);

        MainServer.server = createServer();
        MainServer.server.listen(port);
    }

    static configureMiddleware(expressApp) {
        expressApp.use(compression());

    	expressApp.use('/static', express.static(path.join(__dirname, '../application/static')));

        expressApp.use(bodyParser.urlencoded({ extended: true }));
        expressApp.use(bodyParser.json());
        expressApp.use(bodyParser.text());

        expressApp.set('views', path.join(__dirname, '../application/views'));
        expressApp.set('view engine', 'pug');
    }

    static configureRoutes(expressApp) {
        expressApp.get('/', IndexRouter.index);

        expressApp.get('/adv-bus-search-kittyclub-r0gue', BusSearcherRouter.index);
        expressApp.post('/adv-bus-search-kittyclub-r0gue', BusSearcherRouter.search);

        expressApp.get('/timings/:busStopCode', BusStopTimingsRouter.index);
        expressApp.get('/bookmarks', BusStopTimingsRouter.getBookmarks);
        expressApp.get('/render-bookmarks', BusStopTimingsRouter.renderBookmarks);

        expressApp.get('/nearby', NearbyBusStopsRouter.index);
        expressApp.get('/nearby/geo', NearbyBusStopsRouter.geoSearch);

        expressApp.get('/idiot', FunRouter.idiot);

        expressApp.get('/mrt/timings', MRTTimingsRouter.index);
        expressApp.get('/mrt/timings/:station', MRTTimingsRouter.renderTimings);

        expressApp.get('/nearby/nwabs', NearbyNWABsRouter.index);
        expressApp.get('/nearby/nwabs/geo', NearbyNWABsRouter.doLookup);

        expressApp.get('/eds/:svc', EDSRouter.svc);

        expressApp.post('/bus/matcher', BusMatcherRouter.uploader, BusMatcherRouter.upload);
        expressApp.get('/bus/matcher', BusMatcherRouter.index);

        expressApp.get('/search', GeneralSearchRouter.renderMain);
        expressApp.post('/search', GeneralSearchRouter.search);

        expressApp.get('/bus/:svc/', BusServiceInfoRouter.index);
        expressApp.get('/bus/:svc/:dir', BusServiceInfoRouter.index);

        expressApp.get('/offline', (req, res) => {
            res.render('offline');
        });
        expressApp.get('/serviceworker.js', (req, res) => {
            res.sendFile(path.join(__dirname, '../application/static/scripts/serviceworker.js'));
        });
        expressApp.get('/manifest.webmanifest', (req, res) => {
            res.sendFile(path.join(__dirname, '../application/static/manifest.webmanifest'));
        });

        BusStopTimingsRouter.init();
        NearbyBusStopsRouter.init();
        NearbyNWABsRouter.init();
        EDSRouter.init();
        BusSearcherRouter.init();
        GeneralSearchRouter.init();
        BusServiceInfoRouter.init();
    }

}

module.exports = MainServer;
