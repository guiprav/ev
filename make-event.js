'use strict';

let fs = require('fs');
let path = require('path');
let resolvePath = path.resolve;
let globSync = require('glob').sync;
let moment = require('moment');
let parseDate = require('./parse-date');
let parseParameter = require('./parse-parameter');

let handlers = globSync('handlers/*.make.js').map(function(handlerPath) {
    return require(resolvePath(handlerPath));
});

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
            event[keyValue[1]] = parseParameter(keyValue[2]);
        }
        else {
            event.positionals = event.positionals || [];
            event.positionals.push(parseParameter(arg));
        }
    });

    handlers.forEach(function(handler) {
        try {
            handler.call(event);
        }
        catch(error) {
            if(!error.assertionError) {
                throw error;
            }

            console.error(error.message);
            process.exit(-1);
        }
    });

    fs.writeFileSync(
        dateTime.format('YYYY-MM-DD HH-mm-ss') + '.json',
        JSON.stringify(event, null, 4)
    );
};
