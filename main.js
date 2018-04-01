const DatabaseConnectionManager = require('./database/DatabaseConnectionManager');
const MainServer = require('./server/MainServer');
const HTTPRedirectServer = require('./server/HTTPRedirectServer');
const BusEmailer = require('./addons/BusEmailer/index');

const modules = [
    DatabaseConnectionManager,
    MainServer,
    HTTPRedirectServer,
    BusEmailer
];

modules.forEach(module => module.init());
