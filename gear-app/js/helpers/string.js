/*global define, tizen*/
/*jslint plusplus: true */

/**
 * String helper module
 */

define({
    name: 'helpers/string',
    requires: [
    ],
    def: function helpersString() {
        'use strict';

        /**
         * Returns the input as a string padded on the left to the specified
         * length. By default input is padded with zeros and length
         * is set to 2.
         * @param {mixed} input
         * @param {number} length Pad length (default: 2)
         * @param {string} padString Pad string (default: '0')
         * @return {string}
         */
        function pad(input, length, padString) {
            input = '' + input;
            length = length || 2;
            padString = padString || '0';

            while (input.length < length) {
                input = padString + input;
            }

            return input;
        }

        return {
            pad: pad
        };
    }
});
