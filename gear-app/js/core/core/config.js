/*global define*/

/**
 * Config module
 * @namespace core/config
 * @memberof core
 */

define({
    name: 'core/config',
    def: function config() {
        'use strict';

        var properties = {
            'templateDir': 'templates',
            'templateExtension': '.tpl'
        };

        /**
         * Gets value from configuration.
         * If configuration value doesn’t exists return default value.
         * @memberof core/config
         * @param {string} value
         * @param {string} defaultValue
         */
        function get(value, defaultValue) {
            if (properties[value] !== undefined) {
                return properties[value];
            }
            return defaultValue;
        }

        return {
            get: get
        };

    }
});
