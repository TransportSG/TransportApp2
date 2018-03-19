const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BusServiceSchema = new Schema({
    fullService: String,
    serviceNumber: String,
    variant: String,
    routeDirection: Number,

    routeType: String,
    operator: String,
    interchanges: [
        String
    ],

    frequency: {
        morning: {
            min: Number,
            max: Number
        }, afternoon: {
            min: Number,
            max: Number
        }, evening: {
            min: Number,
            max: Number
        }, night: {
            min: Number,
            max: Number
        }
    },

    stops: [
        {
            busStopCode: String,
            busStopName: String,
            busStopDistance: Number,
            _id: false
        }
    ],
    loopPoint: String
});

module.exports = BusServiceSchema;
