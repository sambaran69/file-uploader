'use strict';

class UserService {

    /**
     * Exposes media provider
     *
     * @returns {MediaProvider}
     */
    static get provider() {
        return require('./lib/provider');
    }

}

module.exports = UserService;
