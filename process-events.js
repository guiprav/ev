'use strict';

let fs = require('fs');
let path = require('path');
let resolvePath = path.resolve;
let basename = path.basename;
let _ = require('lodash');
let globSync = require('glob').sync;
let moment = require('moment');
let mkdirpSync = require('mkdirp').sync;

function jsonStringify(value) {
    return JSON.stringify(value, null, 4);
}

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

    let currentSnapshotsDirectory = moment().format('YYYY-MM-DD HH-mm-ss');
    let currentSnapshotsPath = 'snapshots/' + currentSnapshotsDirectory;

    mkdirpSync(currentSnapshotsPath);

    let events = globSync('!(genesis).json').map(function(eventPath) {
        return require(resolvePath(eventPath));
    });

    events.forEach(function(event) {
        _.each(handlers, function(handler) {
            handler.call(context, event);
        });

        let currentSnapshotPath = (
            currentSnapshotsPath + '/' +
            event.moment.format('YYYY-MM-DD HH-mm-ss') + '.json'
        );

        fs.writeFileSync(currentSnapshotPath, jsonStringify(context));
    });

    let latestSnapshotsPath = 'snapshots/latest';

    if(fs.existsSync(latestSnapshotsPath)) {
        fs.unlinkSync(latestSnapshotsPath);
    }

    fs.symlinkSync(currentSnapshotsDirectory, latestSnapshotsPath);
};
