'use strict';

class PayloadService {

    /**
     * Expose v1 methods
     *
     * @returns {exports|module.exports}
     */
    static get v1() {
        return require('./lib/v1.service');
    }

}

module.exports = PayloadService;
