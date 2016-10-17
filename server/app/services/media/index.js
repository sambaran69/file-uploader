'use strict';

class MediaService {

    /**
     * Exposes media provider
     *
     * @returns {MediaProvider}
     */
    static get provider() {
        return require('./lib/provider');
    }

    /**
     * Exposes media transactor
     *
     * @returns {MediaTransactor}
     */
    static get trans() {
        return require('./lib/trans');
    }

    /**
     * Exposes media stream
     *
     * @returns {MediaStream}
     */
    static get stream() {
        return require('./lib/stream');
    }

}

module.exports = MediaService;
