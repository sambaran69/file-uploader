'use strict';

class MediaService {

    /**
     * Exposes media provider
     *
     * @returns {MediaProvider}
     */
    static provider() {
        return require('./lib/provider');
    }

    /**
     * Exposes media transactor
     *
     * @returns {MediaTransactor}
     */
    static trans() {
        return require('./lib/trans');
    }

    /**
     * Exposes media stream
     *
     * @returns {MediaStream}
     */
    static stream() {
        return require('./lib/stream');
    }

}

module.exports = MediaService;
