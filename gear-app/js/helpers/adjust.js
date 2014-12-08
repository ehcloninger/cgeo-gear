/*global define, console, Math, window*/

/**
 * Adjust helpers module
 */

define({
    name: 'helpers/adjust',
    def: function helpersAdjust() {
        'use strict';

        /**
         * Returns width and height element
         * @param {HTMLElement} element
         * @return {object} dimensions
         * @return {number} dimensions.w Width of the element
         * @return {number} dimensions.h Height of the element
         */
        function getWidthHeightElement(element) {
            if (element.tagName === 'VIDEO') {
                return {
                    w: element.videoWidth,
                    h: element.videoHeight
                };
            } else {
                return {
                    w: element.naturalWidth,
                    h: element.naturalHeight
                };
            }
        }

        /**
         * Adjusts HTML element to fit screen size.
         * @param {HTMLElement} element
         */
        function adjustElement(element) {
            var elementWH = getWidthHeightElement(element),
                W = window.innerWidth,
                H = window.innerHeight,
                isWide = null,
                margin = 0,
                size = 0;

            if (elementWH.h === 0 || H === 0) {
                return;
            }
            isWide = (elementWH.w / elementWH.h >= W / H);
            if (isWide) {
                size = Math.round(elementWH.w * H / elementWH.h);
                margin = (W - size) / 2;
                element.style.marginLeft = margin + 'px';
                element.style.marginTop = '0px';
                element.style.width = size + 'px';
                element.style.height = H + 'px';
            } else {
                size = Math.round(elementWH.h * W / elementWH.w);
                margin = (H - size) / 2;
                element.style.marginLeft = '0px';
                element.style.marginTop = margin + 'px';
                element.style.width = W + 'px';
                element.style.height = size + 'px';
            }
        }

        return {
            adjustElement: adjustElement
        };
    }
});
