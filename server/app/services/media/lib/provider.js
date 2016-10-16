'use strict';

/* Promise is being redefined */
/* jshint -W079 */
const _          = require('lodash');
const Promise    = require('bluebird');
const Media      = require('../models/media.model');
const MediaStore = require('../lib/store');
const store      = new MediaStore(global.config.uploader);

class MediaProvider {

    /**
     * Gets all media objects by user ID
     *
     * @param userId
     * @returns {*|Promise.<Model|null>}
     */
    static getAllByUserId(userId) {
      return new Promise((resolve, reject) => {
        return Media.find({userId: userId}).lean().exec((err, response) => {
          if (err !== null) {
              return reject(err);
          }
          resolve(response);
        });
      });
    }

    /**
     * Gets a single media object by ID
     *
     * @param id
     * @returns {*|Promise.<Model|null>}
     */
    static getOne(id) {
      return new Promise((resolve, reject) => {
        return Media.find({id: id}).lean().exec((err, response) => {
          if (err !== null) {
              return reject(err);
          }
          resolve(response);
      });
    }

    /**
     * Formats defaults (files without a media object)
     *
     * @param file
     * @returns {{key: *, cdnUrl: string, size: *, eTag: (string|XML|*|void)}}
     */
    static formatDefaultFile(file) {
        return {
            key   : file.Key,
            cdnUrl: global.config.hostUrl + '/' + file.Key,
            size  : file.Size,
            eTag  : file.ETag.replace(/"/g, '')
        };
    }

    /**
     * Gets default files by path
     *
     * @param path
     * @returns {*}
     */
    static getDefaultsByPath(path) {
        return new Promise((resolve, reject) => {
            store.getListByPath(path).then((files) => {
                let response = [];
                _.forEach(files, (file) => {
                    response.push(MediaProvider.formatDefaultFile(file));
                });

                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    }

}

module.exports = MediaProvider;
