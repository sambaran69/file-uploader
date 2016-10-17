'use strict';

/**
 * Media store service
 *
 * Uses the AWS.S3 service provided by Amazon to interact with the S3 bucket service
 * for media. Bucket used is set in configuration, whilst profiles used are stored
 * in ~/.aws/credentials; the explicit profile used is also stored in the config
 *
 */

class MediaStore {

    /**
     * Constructor for media store service
     *
     * @param transport
     */
    constructor (transport) {
        this.transport = null;
        try {
            this.transport = require('./transport/' + transport);
        } catch (e) {
            if (e.code === 'MODULE_NOT_FOUND') {
                console.log(new Error('The media transport passed \'' + transport + '\' is invalid.'));
            }
        }
    }

    /**
     * Returns the absolute URL for a file stored in the bucket
     *
     * @param fileName
     * @returns {*}
     */
    getFileStoreUrl (fileName) {
        return this.transport.getFileStoreUrl(fileName);
    }

    /**
     * Uploads the file to S3 bucket (set in config), returns an uploader object which has
     * an event emitter attached to track progress.
     *
     * @param mediaImage
     * @returns {MediaUploadObject}
     */
    createMediaImageUploadStream (mediaImage) {
        return this.transport.createMediaImageUploadStream(mediaImage);
    }

    /**
     * Returns a list of files from a vendor in the bucket
     *
     * @param vendorName
     * @returns {bluebird}
     */
    getListByVendor (vendorName) {
        return this.transport.getListByVendor(vendorName);
    }

    /**
     * Returns a list of files by a given hierarchical path
     *
     * @param path
     * @returns {*}
     */
    getListByPath (path) {
        return this.transport.getListByPath(path);
    }

    /**
     * Returns an object stored under key
     *
     * @param key
     * @returns {bluebird}
     */
    getObject (key) {
        return this.transport.getObject(key);
    }

    /**
     * Deletes a file from the bucket
     *
     * @param file
     * @returns {bluebird}
     */
    deleteFile (file) {
        return this.transport.deleteFile(file);
    }
}
module.exports = MediaStore;
