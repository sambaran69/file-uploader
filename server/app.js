'use strict';

// Globals
global.appRoot   = require('path').resolve(__dirname);
global.config    = require('config');

// Initialise modules
const mongoose    = require('mongoose');
const express     = require('express');
const app         = express();
const server      = require('http').createServer(app);
const connUrl     = global.config.get('db.connection.url');

// Initialise components


// Connect to the mongo DB

mongoose.connect(connUrl, (err) => {
    if (err) {
      console.log(err);
        console.log('Node server not able to connect to Mongo DB. Exiting Service...!');
        process.exit(1);
    } else {
        // Middleware
        require('./express')(app);
        require('./routes')(app);

        // Start server
        server.listen(global.config.port, global.config.ip, function () {
          console.log('Node server listening on %d, in %s mode', global.config.port, app.get('env'));
        });
    }
});

process.on('SIGTERM', function () {
  // TODO: graceful shutdown
  console.log("Killing Service...");
  process.exit();
});

// Expose app
module.exports = app;
