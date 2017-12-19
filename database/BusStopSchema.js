const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BusStopSchema = new Schema({
    busStopCode: String,
    busStopName: String,
    position: {
        latitude: Number,
        longitude: Number
    },
    roadName: String,
    busServices: [{
        serviceNumber: String,
        variant: String,
        fullService: String,
        operator: String,
        busStopDistance: Number,
        busStopNumber: Number,
        direction: Number,
        _id: false
    }]
});

module.exports = BusStopSchema;
