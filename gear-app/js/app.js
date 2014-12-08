/*global require, define, tizen, console*/

/**
 * App module
 */

define({
    name: 'app',
    requires: [
        'views/initPage'
    ],
    def: function appInit() {
        'use strict';

        /**
         * Initiates module.
         */
        function init() {
            console.log('app::init');
        }

        return {
            init: init
        };
    }
});
