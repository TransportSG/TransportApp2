const databaseConfigs = require('./database-config');
const Mongoose = require('mongoose');
const Module = require('../Module');

var connectionTable = {};

class DatabaseConnectionManager extends Module {

    constructor() {
        super();
    }

    static initConnection(databaseName, username, password, serverLocation) {
        return Mongoose.createConnection('mongodb://' + username + ':' + password + '@' + serverLocation + '/' + databaseName + '?authSource=admin', {
            keepAlive: true,
            useMongoClient: true
        });
    }

    static init() {
        Mongoose.Promise = global.Promise;

        Object.keys(databaseConfigs.databases).forEach(databaseName => {
            var databaseAuthData = databaseConfigs.databases[databaseName];
            connectionTable[databaseName] =
                DatabaseConnectionManager.initConnection(databaseName, databaseAuthData.username, databaseAuthData.password, databaseConfigs.databaseLocation);
        });
    }

    static getConnection(databaseName) {
        return connectionTable[databaseName];
    }

}

module.exports = DatabaseConnectionManager;
