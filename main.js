#!/usr/bin/env node

'use strict';

let makeEvent = require('./make-event');
let processEvents = require('./process-events');

let args = process.argv.slice(2);

if(args.length > 0) {
    makeEvent(args);
}
else {
    processEvents();
}
