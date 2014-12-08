/*global define, tizen*/
/*jslint plusplus: true */

/**
 * Page helper module
 */

define({
    name: 'helpers/page',
    requires: [
    ],
    def: function helpersPage() {
        'use strict';

        /**
         * Checks if the page is active
         * @param {HTMLElement} page
         * @return {boolean}
         */
        function isPageActive(page) {
            return page.classList.contains('ui-page-active');
        }

        return {
            isPageActive: isPageActive
        };
    }
});
