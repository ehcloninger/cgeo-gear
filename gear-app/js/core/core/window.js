/*global define, window*/

/**
 * Window module.
 * Module returns window global object.
 * @namespace core/window
 * @memberof core
 *
 * @example
 * //Define `foo` module which require `core/window` module:
 * define({
 *     name: 'foo',
 *     requires: ['core/window'],
 *     def: function (window) {
*          var document = window.document;
 *     }
 * });
 */

define({
    name: 'core/window',
    def: function coreWindow() {
        'use strict';

        return window;
    }
});
