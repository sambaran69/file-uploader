'use strict';

var events = require('events');
var util   = require('util');

/**
 * Constructor
 *
 * @constructor
 */
var MediaUploadObject = function() {
    this.files  = [];
    this.part   = 0;
    this.parts  = 1;
    this.loaded = 0;
    this.total  = 0;

    events.EventEmitter.call(this);
};
util.inherits(MediaUploadObject, events.EventEmitter);

/**
 * Add a file to the files array
 *
 * @param file
 */
MediaUploadObject.prototype.addFile = function(file) {
    this.files.push(file);
};

/**
 * Update an error as an event
 *
 * @param error
 */
MediaUploadObject.prototype.updateError = function(error) {
    this.emit('error', error);
};

/**
 * Update complete as an event
 */
MediaUploadObject.prototype.updateComplete = function() {
    this.emit('complete', this.files);
};

/**
 * Update the progress as an event
 *
 * @param progress
 */
MediaUploadObject.prototype.updateProgress = function(progress) {
    this.emit('progress', progress);
};

module.exports = MediaUploadObject;
