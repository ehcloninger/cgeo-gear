/*jslint forin: true*/
/*global console, window*/


(function debug() {
    'use strict';
    /**
     * Assigns nested attributes
     * @param {object} obj Object.
     * @param {string[]} pathElements Elements array.
     * @param {object} value Object.
     */
    function assignNested(obj, pathElements, value) {
        var i, key = pathElements.pop();
        // check the path
        for (i = 0; i < pathElements.length; i += 1) {
            // if empty create an empty object here
            obj = obj[pathElements[i]] = obj[pathElements[i]] || {};
        }
        obj[key] = value;
    }

    /**
     * Debug object.
     * @property {object} debug
     * @property {object} debug.modules All modules object.
     * @property {object} debug.m All modules object assigned nested.
     * @property {function} debug.listeners Get all listeners for event name.
     * @property {function} debug.init Initialise debug mode.
     * @global
     *
     * @example
     * // To enable debug mode add this line before core.js:
     * // <script src="./core/debug.js"></script>
     * // When you have `foo` module defined:
     * define({
     *     name: 'foo',
     *     def: function def() {
     *         return {
     *             whoami: function whoami() { return 'foo'; }
     *         }
     *     }
     * });
     * // Then you can access to this module with:
     * window.debug.m.foo.whoami(); // foo
     *
     * // You can also access to core inside modules:
     * window.debug.m.core.application.getId();
     */
    window.debug = {
        modules: null,
        m: {},
        listeners: function listeners(name) {
            var i, n, names = this.m.core.event.getListeners(name), keys = [];
            for (n in names) {
                if (names.hasOwnProperty(n)) {
                    keys.push(n);
                }
            }
            keys.sort();
            for (i = 0; i < keys.length; i += 1) {
                n = keys[i];
                console.log(n + ': [' + names[n].join(', ') + ']');
            }
        },
        init: function init(modules) {
            var name;

            if (!modules) {
                console.error('debug: modules not defined!');
                return;
            }
            this.modules = modules;

            for (name in modules) {
                // nested objects for cleaner syntax
                assignNested(
                    this.m,
                    name.split('/'),
                    this.modules[name].instance
                );
            }

        }
    };
}());
