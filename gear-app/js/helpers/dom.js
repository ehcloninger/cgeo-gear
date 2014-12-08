/*global define, tizen*/
/*jslint plusplus: true */

/**
 * Dom helper module
 */

define({
    name: 'helpers/dom',
    requires: [
    ],
    def: function helpersDom() {
        'use strict';

        /**
         * Returns true when child object given as first parameter
         * is the descendant of the parent object given as second parameter,
         * false otherwise.
         * @param {DOMObject} parent
         * @param {DOMObject} child
         * @return {boolean}
         */
        function isDescendant(child, parent) {
            var node = child.parentNode;

            while (node !== null) {
                if (node === parent) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        }

        return {
            isDescendant: isDescendant
        };
    }
});
