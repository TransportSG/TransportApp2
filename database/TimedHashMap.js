class TimedHashMap extends Map {

    constructor(ttl) {
        super();
        this.ttl = ttl;
    }

    get(key) {
        if (this.has(key)) return super.get(key).object;
    }

    set(key, value) {
        super.set(key, {
            creationTime: new Date(),
            object: value
        });
    }

    has(key) {
        if (super.has(key)) {
            var wrapper = super.get(key);
            if (+new Date(new Date() - wrapper.creationTime) >= this.ttl) {
                super.delete(key);
                return false;
            } else return true;
        }
        return false;
    }
}

module.exports = TimedHashMap;
