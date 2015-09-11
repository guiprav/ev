'use strict';

let fs = require('fs');
let moment = require('moment');
let parseDate = require('./parse-date');

function maybeParse(value) {
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
}

module.exports = function(args) {
    let dateTime = moment().format('YYYY-MM-DD HH-mm-ss');
    let event = {};

    event.type = args[0];

    args.slice(1).forEach(function(arg) {
        var keyValue = /^([^:]+):(.+)$/.exec(arg);

        if(keyValue) {
            event[keyValue[1]] = maybeParse(keyValue[2]);
        }
        else {
            event.positionals = event.positionals || [];
            event.positionals.push(maybeParse(arg));
        }
    });

    fs.writeFileSync(dateTime + '.json', JSON.stringify(event, null, 4));
};
