'use strict';

let fs = require('fs');
let path = require('path');
let resolvePath = path.resolve;
let basename = path.basename;
let _ = require('lodash');
let globSync = require('glob').sync;
let moment = require('moment');

module.exports = function() {
    let handlers = globSync('handlers/*.js').map(function(handlerPath) {
        return require(resolvePath(handlerPath));
    });

    let context = (function() {
        let contextFilePath = process.cwd() + '/genesis.json';

        if(fs.existsSync(contextFilePath)) {
            return require(contextFilePath);
        }
        else {
            return {};
        }
    })();

    let events = globSync('!(genesis).json').map(function(eventPath) {
        let event = require(resolvePath(eventPath));

        event.timestamp = moment(
            basename(eventPath, '.json'),
            "YYYY-MM-DD HH-mm-ss"
        ).unix();

        return event;
    });

    events.forEach(function(event) {
        _.each(handlers, function(handler) {
            handler.call(context, event);
        });
    });

    console.log(JSON.stringify(context, null, 4));
};
