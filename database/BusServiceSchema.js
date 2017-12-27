const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BusServiceSchema = new Schema({
    fullService: String,
    serviceNumber: String,
    variant: String,

    routeType: String,
    operator: String,
    interchanges: [

    ],

    firstBus: {
        1: {
            weekdays: [String],
            saturday: [String],
            sunday: [String]
        }, 2: {
            weekdays: [String],
            saturday: [String],
            sunday: [String]
        }
    },
    lastBus: {
            1: {
                weekdays: [String],
                saturday: [String],
                sunday: [String]
            }, 2: {
                weekdays: [String],
                saturday: [String],
                sunday: [String]
            }
    },

    frequency: {
        1: {
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
        }, 2: {
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
        }
    },

    stops: {
        1: [{
            busStopCode: String,
            busStopName: String,
            busStopDistance: Number,
            _id: false
        }], 2: [{
            busStopCode: String,
            busStopName: String,
            busStopDistance: Number,
            _id: false
        }]
    },
    loopPoint: String
});

module.exports = BusServiceSchema;
