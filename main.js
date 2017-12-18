const DatabaseConnectionManager = require('./database/DatabaseConnectionManager');
const MainServer = require('./server/MainServer');
const HTTPRedirectServer = require('./server/HTTPRedirectServer');

const modules = [
    DatabaseConnectionManager,
    MainServer,
    HTTPRedirectServer
];

modules.forEach(module => module.init());
