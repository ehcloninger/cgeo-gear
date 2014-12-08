/*global define, console*/

/**
 * HTTP module
 * @requires {@link core/window}
 * @namespace core/http
 * @memberof core
 */

define({
    name: 'core/http',
    requires: [
        'core/window'
    ],
    def: function coreHttp(window) {
        'use strict';

        /**
         * Creates and send request
         * @memberof core/http
         * @param {object} options Options.
         * @param {string} options.url Url.
         * @param {boolean} [options.async=false] Async mode.
         * @param {function} [options.success] Success callback.
         * @param {function} [options.progress] Progress callback.
         * @param {function} [options.error] Error callback.
         * @return {XMLHttpRequest} req Request object.
         */
        function request(options) {
            var req = null,
                async = null,
                url = null;

            options = options || {};
            async = typeof options.async === 'boolean' ? options.async : false;
            url = options.url !== undefined ? options.url : null;

            if (url === null) {
                console.error('Url is empty, please provide correct url.');
                return;
            }

            req = new window.XMLHttpRequest();
            req.open('GET', url, async);

            if (typeof options.success === 'function') {
                req.addEventListener('load', function load() {
                    options.success(req.response);
                }, false);
            }

            if (typeof options.error === 'function') {
                req.addEventListener('error', function error(evt) {
                    options.error(evt.target.status);
                }, false);
            }

            if (typeof options.progress === 'function') {
                req.addEventListener('progress', function progress(evt) {
                    options.progress(evt);
                }, false);
            }

            req.send();

            return req;
        }

        return {
            request: request
        };
    }
});
