'use strict';

/* Promise is being redefined */
/* jshint -W079 */
const Promise        = require('bluebird');

const _              = require('lodash');
const path           = require('path');
const MediaModel     = require('../models/media.model');
const defaultOptions = {
    userId     : null,
    secure     : false,
    private    : false
};

class MediaTransactor {

    /**
     * Returns a promise with the mapped promises of MediaTransactor.create for each file
     * @param files
     * @param vendorId
     * @returns {Promise|*}
     */
    static createBatch(files, userId) {
        return Promise.map(files, (file) => {
            return MediaTransactor.create(file, userId);
        });
    }

    /**
     * Creates media meta data item from a mediaFile object
     *
     * @param mediaFile
     * @param userId
     * @returns {*}
     */
    static create(mediaFile, userId) {
        mediaFile = _.merge({}, defaultOptions, mediaFile);

        // Clean properties incoming from data objects
        let properties      = {};
        properties.userId   = userId;
        properties.name     = path.basename(mediaFile.name, ('.' + mediaFile.extension));
        properties.mime     = mediaFile.contentType;
        properties.path     = mediaFile.path;
        properties.ext      = mediaFile.extension;
        properties.size     = mediaFile.size;
        properties.secure   = mediaFile.secure;
        properties.private  = mediaFile.private;

        // Instantiate model
        let model = new MediaModel(properties);
        return new Promise((resolve, reject) => {
            model.save((err, response) => {
                if (err !== null) {
                    return reject(err);
                }
                resolve(response);
            });
        });
    }

}

module.exports = MediaTransactor;
