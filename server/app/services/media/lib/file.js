'use strict';

/* Promise is being redefined */
/* jshint -W079 */

var crypto   = require('crypto');
var util     = require('util');
var _        = require('lodash');
var fileType = require('file-type');
var Promise  = require('bluebird');
var fs       = Promise.promisifyAll(require('fs'));

// Set allowed file types
var _allowedFileTypes = global.config.allowedFileTypes;

/**
 * Instantiates a MediaRetrieveService file for a vendor
 *
 * @param vendorName
 * @constructor
 */
class MediaFile {

    constructor(vendorName) {
        this.vendor = vendorName;
        this.hash   = crypto.randomBytes(20).toString('hex');
    }

    /**
     * Finalises instantiation for MediaRetrieveService via direct file
     *
     * @param file
     * @returns {bluebird|exports|module.exports}
     */
    fromPath(file) {
        var self = this;

        return new Promise(function (resolve, reject) {

            // Get file info and resolve
            fs.readFileAsync(file).then(function (buffer) {
                var ft        = fileType(buffer);
                self.buffer   = buffer;
                self.ext      = util.format('%s', ft.ext);
                self.mime     = ft.mime;
                self.fileType = _.find(_allowedFileTypes, {ext: self.ext});
                self.size     = buffer.length;

                // Reject for not allowed file types
                if (!self.isFileAllowed()) {
                    reject(new Error('File type not allowed'));
                }

                resolve(self.getObject());
            }).error(function (err) {
                reject(err);
            });

        });
    }

    /**
     * Finalises instantiation for MediaRetrieveService via direct buffer
     *
     * @param buffer
     * @returns {bluebird|exports|module.exports}
     */
    fromBuffer(buffer) {
        var self = this,
            ft   = fileType(buffer);

        return new Promise(function (resolve, reject) {
            try {
                self.buffer   = buffer;
                self.ext      = util.format('%s', ft.ext);
                self.mime     = ft.mime;
                self.fileType = _.find(_allowedFileTypes, {ext: self.ext});
                self.size     = buffer.length;

                // Reject for not allowed file types
                if (!self.isFileAllowed()) {
                    reject(new Error('File type not allowed'));
                }

                resolve(self.getObject());
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Returns true if the file type is allowed
     *
     * @returns {boolean}
     */
    isFileAllowed() {
        var self = this;

        return (!_.isUndefined(self.fileType));
    }

    /**
     * Create a file object and returns it
     *
     * @returns {*}
     */
    getObject() {
        var self = this;

        return {
            name       : self.getFileName(),
            type       : self.fileType.type,
            extension  : self.ext,
            contentType: self.mime,
            size       : self.size,
            buffer     : self.buffer,
            vendorName : self.vendor,
            fullName   : self.getFileDirectory() + '/' + self.getFileName(),
            path       : self.getFileDirectory(),
            thumbsDir  : self.getFileThumbsDirectory()
        };
    }

    /**
     * Returns the file name
     *
     * @returns {*}
     */
    getFileName() {
        var self = this;

        return util.format('%s.%s', self.hash, self.ext);
    }

    /**
     *
     * @returns {*}
     */
    getFileDirectory() {
        var self = this;

        return util.format('%s/%s', self.vendor, self.fileType.type);
    }

    /**
     * Returns the directory for the thumbnails for a particular image
     *
     * @returns {*}
     */
    getFileThumbsDirectory() {
        var self = this;

        return util.format('%s/%s', self.getFileDirectory(), self.hash);
    }

}

module.exports = MediaFile;
