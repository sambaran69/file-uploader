"use strict";

const express       = require('express');
let router          = express.Router();

// Bootstraps the :userId param into the request for subsequent requests
// @TODO: With Express 4.5+ this can be better addressed with mergeParams option on the child router declaration
router.use('/:userId([0-9]+)*', function (req, res, next) {
    if (req.params.vendorId) {
        req.userId = parseInt(req.params.userId);
    }
    next();
});

// Nested routes
router.use('/', require('./vendor'));
router.use('/:vendorId/media', require('./media'));

module.exports = router;
