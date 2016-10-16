'use strict';

/**
 * Media store service
 *
 * Uses the AWS.S3 service provided by Amazon to interact with the S3 bucket service
 * for media. Bucket used is set in configuration, whilst profiles used are stored
 * in ~/.aws/credentials; the explicit profile used is also stored in the config
 *
 */

var Bluebird    = require('bluebird');
var util        = require('util');
var _           = require('lodash');
var stream      = require('stream');
var MediaObject = require(global.appRoot + '/src/lib/uploadObject');
const fileType  = require('file-type');

// Bootstrap AWS-SDK service for S3 use
var s3 = (function (AWS) {
    AWS.config.apiVersions = {s3: '2006-03-01'};

    // If we have env variables use those
    if (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY) {
        AWS.config.update({
            accessKeyId    : process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY
        });
        // Otherwise look for the profile
    } else {
        AWS.config.credentials = new AWS.SharedIniFileCredentials({
            profile: global.config.transport.aws.s3Profile
        });
    }

    // Initialise s3 bucket
    return new AWS.S3({
        params: {
            Bucket: global.config.transport.aws.s3Bucket,
            ACL   : 'private'
        }
    });
}(require('aws-sdk')));

class S3MediaStore {

    /**
     * Returns the absolute URL for a file stored in the bucket
     *
     * @param fileName
     * @returns {*}
     */
    static getFileStoreUrl(fileName) {
        return `${global.config.hostUrl}/${fileName}`;
    }

    /**
     * Internal, upload a part of a media image sequence
     *
     * @param uploader
     * @param uploadOptions
     * @returns {bluebird|exports|module.exports}
     * @private
     */
    static uploadBufferPart(uploader, uploadOptions) {
        return new Bluebird((resolve, reject) => {
            this.currentLoaded = uploader.loaded;
            this.loaded        = this.currentLoaded;

            // Increase part
            uploader.part++;

            // Perform upload
            s3.upload(uploadOptions)

                // In progress, emit event
                .on('httpUploadProgress', (event) => {
                    this.loaded    = this.currentLoaded + event.loaded;
                    let percentage = Math.floor((this.loaded / uploader.total) * 100);

                    uploader.updateProgress(percentage);
                })

                // Perform send
                .send((err) => {
                    if (err) {
                        uploader.updateError(err);
                        reject(err);
                    } else {
                        if (uploader.part >= uploader.parts) {
                            uploader.updateComplete();
                        }

                        uploader.loaded = this.loaded;
                        resolve(uploader);
                    }
                });
        });
    }

    /**
     * Uploads the file to S3 bucket (set in config), returns an uploader object which has
     * an event emitter attached to track progress.
     *
     * @param mediaImage
     * @returns {MediaUploadObject}
     */
    static createMediaImageUploadStream(mediaImage) {
        let self         = this;
        let uploader     = new MediaObject();
        let bufferStream = new stream.PassThrough();
        let file         = mediaImage.mediaObject;

        // Add buffer stream
        bufferStream.end(file.buffer);

        // Add url to file object
        file.url = self.getFileStoreUrl(file.fullName);
        uploader.addFile(file);

        // Initialise upload options array, because of the way Bluebird.reduce works, include empty object in array
        let uploadOptionsArray = [];

        // Add first set of options to options array (main file)
        uploadOptionsArray.push({
            Key          : file.fullName,
            Body         : bufferStream,
            ContentType  : file.contentType,
            ContentLength: file.buffer.length
        });

        // Go over thumbs and process some data
        uploader.total = file.buffer.length;
        _.forEach(mediaImage.thumbnails, function (thumb) {
            uploader.total += thumb.buffer.length;
            uploader.parts++;

            let thumbBufferStream = new stream.PassThrough();
            thumbBufferStream.end(thumb.buffer);

            // Push new set of upload options to array
            uploadOptionsArray.push({
                Key          : util.format('%s/%s', file.thumbsDir, thumb.name),
                Body         : thumbBufferStream,
                ContentType  : fileType(thumb.buffer).mime, //file.contentType,
                ContentLength: thumb.buffer.length
            });
        });

        // Sequentially upload the media segments
        Bluebird.each(uploadOptionsArray, (options) => self.uploadBufferPart(uploader, options));

        return uploader;
    }

    /**
     * Returns a list of files from a vendor in the bucket
     *
     * @param vendorName
     * @returns {bluebird}
     */
    static getListByVendor(vendorName) {
        let path = `${vendorName}/`;

        return S3MediaStore.getListByPath(path);
    }

    /**
     * Returns a list of files by hierarchical path in the bucket
     * @param path
     */
    static getListByPath(path) {
        let files = [];

        return new Bluebird(function (resolve, reject) {
            s3.listObjects({
                Prefix: path
            }, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    _.forEach(response.Contents, function (file) {
                        // Ignore directories
                        if (file.Key.substr(file.Key.length - 1) !== '/') {
                            files.push(file);
                        }
                    });

                    resolve(files);
                }
            });
        });
    }

    /**
     * Gets an S3 bucket object by its key
     *
     * @param key
     * @returns {bluebird|exports|module.exports}
     */
    static getObject(key) {
        return new Bluebird((resolve, reject) => {
            s3.getObject({
                Key: key
            }, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Deletes a file from the bucket
     *
     * @param file
     * @returns {bluebird}
     */
    static deleteFile(file) {
        return new Bluebird(function (resolve, reject) {
            s3.deleteObject({
                Key: file
            }, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
}

module.exports = S3MediaStore;
