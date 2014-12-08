/*global define, console, document, tau*/
/*jslint plusplus: true*/

/**
 * Picture size page module
 */

define({
    name: 'views/pictureSize',
    requires: [
        'core/event',
        'core/template',
        'models/camera'
    ],
    def: function viewsPictureSize(req) {
        'use strict';

        var page = null,
            e = req.core.event,
            t = req.core.template,
            camera = req.models.camera,

            pictureSizeList = null;

        /**
         * Handles views.settings.show event.
         */
        function show() {
            tau.changePage('#picture-size');
        }

        /**
         * Renders page UI.
         */
        function renderView() {
            var sizes = camera.getAvailablePictureSizes(),
                currentSize = camera.getPictureSize(),
                i = 0,
                len = sizes.length,
                content = [],
                size = null,
                checked = false;

            for (i = 0; i < len; i += 1) {
                size = sizes[i];
                checked = currentSize.height === size.height &&
                    currentSize.width === size.width;
                content.push(t.get('pictureSizeRow', {
                    width: size.width,
                    height: size.height,
                    checked: checked
                }));
            }

            pictureSizeList.innerHTML = content.join('');
        }

        /**
         * Handles pagebeforeshow event.
         */
        function onPageBeforeShow() {
            renderView();
        }

        /**
         * Handles click event on size list.
         */
        function onSizeListClick() {
            var input = pictureSizeList.querySelectorAll('input:checked')[0],
                width = parseInt(input.getAttribute('data-width'), 10),
                height = parseInt(input.getAttribute('data-height'), 10);

            camera.setPictureSize({
                width: width,
                height: height
            });
        }

        /**
         * Registers view event listeners.
         */
        function bindEvents() {
            page.addEventListener('pagebeforeshow', onPageBeforeShow);
            pictureSizeList.addEventListener('click', onSizeListClick);
        }

        /**
         * Initiates module.
         */
        function init() {
            page = document.getElementById('picture-size');
            pictureSizeList = document.getElementById('picture-size-list');
            bindEvents();
        }

        e.listeners({
            'views.settings.show.pictureSize': show
        });

        return {
            init: init
        };
    }

});
