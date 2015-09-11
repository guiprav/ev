'use strict';

let chrono = require('chrono-node');

module.exports = function(value) {
    if(value === 'now') {
        return new Date();
    }

    return chrono.parseDate(value);
};
