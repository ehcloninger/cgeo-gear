/*global define, console*/

/**
 * Storage module
 * @requires {@link core/window}
 * @namespace core/storage/localstorage
 * @memberof core
 */

define({
    name: 'core/storage/localstorage',
    requires: [
        'core/window'
    ],
    def: function coreStorage(window) {
        'use strict';

        var localStorage = window.localStorage,
            JSON = window.JSON;

        /**
         * Gets value for given key from local storage.
         * @memberof core/storage/localstorage
         * @param {string} key Key.
         * @return {null|object} Json object.
         */
        function get(key) {
            var storageStr = localStorage.getItem(key);
            if (storageStr) {
                try {
                    return JSON.parse(storageStr);
                } catch (error) {
                    console.warn('core/storage', 'Parse error:', error);
                    return null;
                }
            }
            return null;
        }

        /**
         * Sets value for given key to local storage.
         * @memberof core/storage/localstorage
         * @param {string} key Key.
         * @param {object} val Value object.
         * @return {boolean}
         */
        function set(key, val) {
            var json = null;
            try {
                json = JSON.stringify(val);
            } catch (error) {
                console.warn('Stringify error', error);
            }

            if (json !== null) {
                localStorage.setItem(key, json);
                return true;
            }

            return false;
        }

        /**
         * Removes value for given key from local storage.
         * @param {string} key Key name.
         */
        function removeItem(key) {
            localStorage.removeItem(key);
        }

        /**
         * Removes keys from given array.
         * @param {string[]} keys Key array.
         */
        function removeItems(keys) {
            keys.forEach(function forEach(key) {
                removeItem(key);
            });
        }

        /**
         * Removes value for given context.
         * @memberof core/storage/localstorage
         * @param {string|array} context Key name or keys array.
         */
        function remove(context) {
            if (typeof context === 'string') {
                removeItem(context);
            } else if (Array.isArray(context)) {
                removeItems(context);
            }
        }

        return {
            get: get,
            /**
             * Alias for {@link core/storage/localstorage.set}
             * @memberof core/storage/localstorage
             * @function
             * @see {@link core/storage/localstorage.set}
             */
            add: set,
            set: set,
            remove: remove
        };
    }
});
