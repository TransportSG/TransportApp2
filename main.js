const DatabaseConnectionManager = require('./database/DatabaseConnectionManager');
const MainServer = require('./server/MainServer');
const HTTPRedirectServer = require('./server/HTTPRedirectServer');
const BusEmailer = require('./addons/BusEmailer/index');
const Log123 = require('./addons/Log123/index');

const modules = [
    DatabaseConnectionManager,
    MainServer,
    HTTPRedirectServer,
    BusEmailer,
    Log123
];

modules.forEach(module => module.init());
