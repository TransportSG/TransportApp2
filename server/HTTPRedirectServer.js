const Module = require('../Module');
const URL = require('url');
const http = require('http');

const serverConfig = require('./server-config.json');

class HTTPRedirectServer extends Module {

    constructor() {
    }

    static init() {
        if (serverConfig.httpsEnabled) {
            HTTPRedirectServer.server = http.createServer((req, res) => {
                res.writeHead(301, {
                    Location: toURL + URL.parse(req.url).pathname
                });
                res.end();
            });

            HTTPRedirectServer.server.listen(serverConfig.httpPort);
        }
    }

}

module.exports = HTTPRedirectServer;
