class Module {

    constructor() {

    }

    static init() {
        throw new Error('Empty module!');
    }

}

module.exports = Module;
