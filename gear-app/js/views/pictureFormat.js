/*global define, console, document, tau*/
/*jslint plusplus: true*/

/**
 * Picture format page module
 */

define({
    name: 'views/pictureFormat',
    requires: [
        'core/event',
        'core/template',
        'models/camera'
    ],
    def: function viewsPictureFormat(req) {
        'use strict';

        var page = null,
            e = req.core.event,
            t = req.core.template,
            camera = req.models.camera,

            formatList = null;

        /**
         * Handles views.settings.show event.
         */
        function show() {
            tau.changePage('#picture-format');
        }

        /**
         * Renders page UI.
         */
        function renderView() {
            var formats = camera.getAvailablePictureFormats(),
                currentFormat = camera.getPictureFormat(),
                i = 0,
                len = formats.length,
                content = [],
                format = null,
                checked = false;

            for (i = 0; i < len; i += 1) {
                format = formats[i];
                checked = currentFormat === format;
                content.push(t.get('pictureFormatRow', {
                    format: format,
                    checked: checked
                }));
            }

            formatList.innerHTML = content.join('');
        }

        /**
         * Handles pagebeforeshow event.
         */
        function onPageBeforeShow() {
            renderView();
        }

        /**
         * Handles click event on format list.
         */
        function onFormatListClick() {
            var input = formatList.querySelectorAll('input:checked')[0];

            camera.setPictureFormat(input.getAttribute('data-format'));
        }

        /**
         * Registers view event listeners.
         */
        function bindEvents() {
            page.addEventListener('pagebeforeshow', onPageBeforeShow);
            formatList.addEventListener('click', onFormatListClick);
        }

        /**
         * Initiates module.
         */
        function init() {
            page = document.getElementById('picture-format');
            formatList = document.getElementById('picture-format-list');
            bindEvents();
        }

        e.listeners({
            'views.settings.show.pictureFormat': show
        });

        return {
            init: init
        };
    }

});
