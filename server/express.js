'use strict';
/**
 * Express configuration
 */
var compression    = require('compression');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cookieParser   = require('cookie-parser');
var cors           = require('cors');

module.exports = function (app) {
    app.use(compression());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    app.set('etag', 'strong');

    // CORS settings
    var corsOptions = {};
    var origins = global.config.get('origins');
    if (origins) {
        corsOptions.origin = origins;
    }
    app.use(cors(corsOptions));
    process.setMaxListeners(100);
};
