'use strict';

var _     = require('lodash');

/**
 * Filtered request object
 *
 * @param req
 * @returns {{method: (req.method|*), path: (req.path|*), body: *}}
 * @private
 */
var _getRequestInfo = function(req) {
    return {
        method: req.method,
        path  : req.originalUrl,
        body  : req.body
    };
};

/**
 * Builds success payload
 *
 * @param req
 * @param data
 * @param detail
 * @returns {{}}
 */
exports.success = function(req, data, detail) {
    detail = detail || '';

    var payload = {};

    // Build payload
    payload.result  = 'success';
    payload.detail  = detail;
    payload.data    = (_.isArray(data) ? data : [data]);
    payload.request = _getRequestInfo(req);

    return payload;
};

/**
 * Builds failure payload
 *
 * @param req
 * @param err
 * @param detail
 */
exports.fail = function(req, err, detail) {
    detail = detail || '';

    var payload = {};

    // Build payload
    payload.result  = 'fail';
    payload.detail  = detail;
    payload.request = _getRequestInfo(req);

    // Error
    payload.error = err;

    return payload;
};
