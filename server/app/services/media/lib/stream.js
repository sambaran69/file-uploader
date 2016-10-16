'use strict';

const Bluebird      = require('bluebird');
const _             = require('lodash');
const crypto        = require('crypto');
const request       = require('request');
const validUrl      = require('valid-url');
const fileType      = require('file-type');
const MediaFile     = require('./file');
const MediaImage    = require('./image');
const MediaStore    = require('./store');
const MediaProvider = require('./provider');

class MediaStream {

    /**
     * Creates a media item and establishes a stream to pipe messaging to the client
     *
     * @param userName
     * @param buffer
     * @returns {*|Bluebird.<Model|null>}
     */
    static upload(userName, buffer) {
        return new MediaFile(userName).fromBuffer(buffer)
            .then((fileObj) => MediaStream.processFile(fileObj))
            .then((image) => new MediaStore(global.config.uploader).createMediaImageUploadStream(image))
            .catch((e)=> {
                return global.logger.error("Failed to complete MediaStream.processFile", e);
            });
    }

    /**
     * Process a file prior to passing it over to the media handlers
     *
     * @param fileObj
     */
    static processFile(fileObj) {
        var file = new MediaImage(fileObj);

        return new Bluebird((resolve) => {
            switch (true) {
                case (file.mediaObject.contentType.indexOf('image') !== -1):
                    file.cropThumbnails(global.config.image.cropSizes).then(() => {
                        resolve(file);
                    });
                    return;

                case (file.mediaObject.contentType.indexOf('application/pdf') !== -1):
                    global.logger.debug('pdf');
                    file.cropPDFThumbnails(global.config.image.cropSizes).then(() => {
                        resolve(file);
                    });
                    return;

                case (file.mediaObject.contentType.indexOf('audio') !== -1):
                    global.logger.debug('audio');
                    return resolve(file);

                case (file.mediaObject.contentType.indexOf('video') !== -1):
                    global.logger.debug('audio');
                    return resolve(file);

                default:
                    return resolve(file);
            }
        });
    }

    /**
     * Generates an md5 hash from string
     *
     * @param buffer
     * @returns {*}
     */
    static generateMD5(buffer) {
        var hash = crypto.createHash("md5");
        hash.update(buffer);
        return hash.digest("hex");
    }

    /**
     * Constructs a buffer response object
     *
     * @param buffer
     * @returns {*}
     */
    static getBufferResponseObject(buffer) {
        return {
            buffer : buffer,
            headers: {
                'Content-Type' : (_.isObject(fileType(buffer))) ? fileType(buffer).mime : 'application/octet-stream',
                'Cache-Control': 'public, max-age=345600',
                'Expires'      : new Date(Date.now() + 345600000).toUTCString(),
                'Etag'         : MediaStream.generateMD5(buffer)
            }
        };
    }

    /**
     * Downloads a media file, note that if the identifier param is a string, it will look by URL and if
     * the param is a number it will look by media ID
     *
     * @param identifier
     * @returns {Bluebird.<T>}
     */
    static download(identifier) {
        return new Bluebird((resolve, reject) => {
            if (_.isString(identifier)) {
                if (validUrl.is_web_uri(identifier)) {
                    // If it's a string and valid URL
                    resolve(MediaStream.downloadByUrl(identifier));
                } else {
                    // If it's a string and invalid URL, download by Key
                    resolve(MediaStream.downloadByKey(identifier));
                }
            } else if (_.isNumber(parseInt(identifier, 10))) {
                // If it's a number, assume media ID
                resolve(MediaStream.downloadByMediaId(identifier));
            } else {
                // No matches
                const err = new Error('Download parameter must be either a string (URL) or number (media ID)');
                global.logger.error(err);
                reject(err);
            }
        }).then((buffer) => {
            return MediaStream.getBufferResponseObject(buffer);
        });
    }

    /**
     * Downloads media by key
     *
     * @param key
     * @returns {bluebird}
     */
    static downloadByKey(key) {
        global.logger.debug(' :: Downloading media by key [%s]', key);
        return new MediaStore(global.config.uploader).getObject(key).then((media) => {
            return media.Body;
        });
    }

    /**
     * Download by ID
     *
     * @param id
     */
    static downloadByMediaId(id) {
        global.logger.log(' :: Downloading media by media ID [%s]', id);

        return new Bluebird((resolve, reject) => {
            MediaProvider.getOne(id).then((response) => {
                var key = require('util').format('%s/%s.%s', response.path, response.name, response.ext);
                global.logger.debug('Search for media with key: ' + key);

                MediaStream.downloadByKey(key).then((response) => {
                    global.logger.debug(' :: Downloaded image by key [%s]', key);

                    resolve(response);
                }).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * Download by URL
     *
     * @param url
     * @returns {bluebird|exports|module.exports}
     */
    static downloadByUrl(url) {
        global.logger.debug(' :: Downloading media by URL [%s]', url);

        return new Bluebird((resolve, reject) => {
            // If identifier is string, assume URL
            request.defaults({encoding: null, timeout: 2000}).get(url, function (err, response, body) {
                if (err) {
                    reject(err);
                } else {
                    if (response.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject({message: 'Image not found from url: ' + url, status: response.statusCode});
                    }
                }
            });
        });
    }

}

module.exports = MediaStream;
