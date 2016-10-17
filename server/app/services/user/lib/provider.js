'use strict';

/* Promise is being redefined */
/* jshint -W079 */
const _          = require('lodash');
const Promise    = require('bluebird');
const User      = require('../models/user.model');

class UserProvider {
    /**
     * Gets a single media object by ID
     *
     * @param id
     * @returns {*|Promise.<Model|null>}
     */
    static getOne(id) {
      return new Promise((resolve, reject) => {
          let user = new User();
          user.id = id;
          user.name = "Test User";
          resolve(user);
      });
    }

}

module.exports = UserProvider;
