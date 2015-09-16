'use strict';

let fs = require('fs');
let path = require('path');
let resolvePath = path.resolve;
let globSync = require('glob').sync;
let moment = require('moment');
let pad = require('pad');
let dateTimeFormat = require('./date-time-format');
let parseDate = require('./parse-date');
let parseParameter = require('./parse-parameter');

let handlers = globSync('cli-parsers/*.js').map(function(handlerPath) {
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

    {
        let fileName;
        let maxCount = 999;

        for(let i = 0; i < maxCount; ++i) {
            fileName = (
                dateTime.format(dateTimeFormat) +
                '.' + pad(3, i, '0') + '.ev.json'
            );

            if(!fs.existsSync(fileName)) {
                break;
            }
            else
            if(i === maxCount - 1) {
                throw new Error("Too many events for a second.");
            }
        }

        fs.writeFileSync(fileName, JSON.stringify(event, null, 4));
    }
};
