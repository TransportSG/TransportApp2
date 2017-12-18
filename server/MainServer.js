const Module = require('../Module');
const http = require('http');
const https = require('https');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path')
const FunctionUtils = require('../utils/FunctionUtils');

const IndexRouter = require('../application/routes/IndexRouter');

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
        var port = serverConfig.httpsEnabled ? 443 : serverConfig.port;

        var createServer = FunctionUtils.bindArgsAsArray(protocol.createServer, serverConfig.httpsEnabled ? [{
            key: fs.readFileSync('https/privkey.pem'),
            cert: fs.readFileSync('https/cert.pem'),
            ca: fs.readFileSync('/https/chain.pem')
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
    }

}

module.exports = MainServer;
