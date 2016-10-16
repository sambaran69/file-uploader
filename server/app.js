'use strict';

// Environment Defaults
process.env.NODE_ENV = process.env.NODE_ENV || 'local';

// Globals
global.appRoot   = require('path').resolve(__dirname);
global.config    = require('config');

// Initialise modules
const express     = require('express');
const app         = express();
const server      = require('http').createServer(app);
const io          = socket.listen(server);
const connUrl     = global.config.get('db.connection.url');

// Initialise components


// Connect to the mongo DB

mongoose.connect(connUrl, (err) => {
    if (err) {
        process.exit(1);
    } else {
        // Set default origin headers
        const origins = global.config.get('origins');
        if (origins) {
          io.set('origins', origins);
        }

        // Middleware
        require('./config/express')(app);
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
