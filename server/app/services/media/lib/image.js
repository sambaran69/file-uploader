'use strict';

/* Promise is being redefined */
/* jshint -W079 */

var Promise  = require('bluebird');
var util     = require('util');
var sharp    = require('sharp');
var gm  = require('gm').subClass({imageMagick: true});

/**
 * Media Image handler
 */
class MediaImage {

    /**
     * Initializes media image
     *
     * @param mediaObject
     */
    constructor (mediaObject) {

        this.mediaObject = mediaObject;
        this.thumbnails  = [];

        // Default options
        this.defaultOptions = {
            secure : false,
            private: false
        };
    }

    /**
     * Crops the bound mediaObject into thumbnails and pushes them into the internal thumbnails property
     *
     * @param cropSizes
     * @returns {*}
     */
    cropThumbnails (cropSizes) {
        var self = this;

        return Promise.map(cropSizes, function (size) {
            return self.cropMediaObject(self.mediaObject, size).then(function (thumbnail) {
               self.thumbnails.push(thumbnail);
            });
        });
    }

    cropPDFThumbnails (cropSizes) {
        var self = this;

        return Promise.map(cropSizes, function (size) {
            return self.createPdfDisplayImage( size).then(function (thumbnail) {
                self.thumbnails.push(thumbnail);
            });
        });
    }

    createPdfDisplayImage (size){
        var self = this;
        return new Promise((resolve, reject) => {
            gm(self.mediaObject.buffer,this.mediaObject.name)
                .density(600, 600)
                .resize(size)
                .toBuffer('png', function(err, buffer) {
                    if (err) {
                        reject();
                    } else {
                        resolve({
                            buffer: buffer,
                            name  : util.format('%sx%s.%s', size, size, 'png'),
                            contentType: 'image/png'

                        });
                    }
                });
        });
    }

    /**
     * Performs the actual crop of a mediaImageObject by size
     *
     * @param mediaObject
     * @param size
     * @returns {bluebird}
     */
    cropMediaObject (mediaObject, size) {
        var image = sharp(mediaObject.buffer);

        return new Promise(function (resolve, reject) {
            image.metadata().then(function (metaData) {
                size = size || ((metaData.height < metaData.width) ? metaData.height : metaData.width);

                image
                    .resize(size, size)
                    .crop(sharp.gravity.center)
                    .toBuffer(function (err, buffer) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                buffer: buffer,
                                name  : util.format('%sx%s.%s', size, size, mediaObject.extension)
                            });
                        }
                    });
            });
        });
    }
}

module.exports = MediaImage;
