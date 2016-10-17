'use strict';

class UserService {

    /**
     * Exposes media provider
     *
     * @returns {MediaProvider}
     */
    static provider() {
        return require('./lib/provider');
    }

}

module.exports = UserService;
