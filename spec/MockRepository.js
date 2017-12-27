const Repository = require('../database/Repository');

class MockRepository extends Repository {

    constructor(customFind) {
        super();
        this.queryResult = {};
        this.customFind = !!customFind;
    }

    findOne(query, callback) {
        callback(null, this.queryResult[query]);
    }

    find(query, callback) {
        findOne(query, callback);
    }

    create(data, callback) {

    }

    remove(query, callback) {

    }

    updateOne(query, data, callback) {

    }

    updateAll(query, data, callback) {

    }

    setQueryResult(result) {
        this.queryResult = result;
    }

}

module.exports = MockRepository;
