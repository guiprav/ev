'use strict';

let moment = require('moment');

module.exports = function(value) {
    if(value[0] === '@') {
        return moment(parseDate(value.slice(1))).format('YYYY-MM-DD HH-mm-ss');
    }

    try {
        return JSON.parse(value);
    }
    catch(error) {
        if(value.indexOf(',') !== -1) {
            return value.split(',').map(maybeParse);
        }
        else {
            return value;
        }
    }
};
