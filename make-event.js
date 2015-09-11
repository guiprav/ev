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
    let event = {};

    event.type = args.shift();

    let dateTime = (function() {
        let dateTime = parseDate(args[0]);

        if(dateTime) {
            dateTime = moment(dateTime);
            args.shift();
        }
        else {
            dateTime = moment();
        }

        return dateTime;
    })();

    args.forEach(function(arg) {
        var keyValue = /^([^:]+):(.+)$/.exec(arg);

        if(keyValue) {
            event[keyValue[1]] = maybeParse(keyValue[2]);
        }
        else {
            event.positionals = event.positionals || [];
            event.positionals.push(maybeParse(arg));
        }
    });

    fs.writeFileSync(
        dateTime.format('YYYY-MM-DD HH-mm-ss') + '.json',
        JSON.stringify(event, null, 4)
    );
};
