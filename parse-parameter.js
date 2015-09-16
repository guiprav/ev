'use strict';

let moment = require('moment');
let dateTimeFormat = require('./date-time-format');

module.exports = exports = function(value) {
    if(value[0] === '@') {
        return moment(parseDate(value.slice(1))).format(dateTimeFormat);
    }

    try {
        return JSON.parse(value);
    }
    catch(error) {
        if(value.indexOf(',') !== -1) {
            return value.split(',').map(exports);
        }
        else {
            return value;
        }
    }
};
