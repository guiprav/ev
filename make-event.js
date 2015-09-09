'use strict';

let fs = require('fs');
let moment = require('moment');

module.exports = function(args) {
    let dateTime = moment().format('YYYY-MM-DD HH-mm-ss');
    let event = {};

    event.type = args[0];

    args.slice(1).forEach(function(arg) {
        var parsed = /^([^:]+):(.+)$/.exec(arg);

        if(!parsed) {
            console.error("Cannot parse argument " + (i + 1) + ": '" + arg + '".');
            process.exit(-1);
        }

        event[parsed[1]] = parsed[2];
    });

    fs.writeFileSync(dateTime + '.json', JSON.stringify(event, null, 4));
};
