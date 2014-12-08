/*global define, console, document, tau*/
/*jslint plusplus: true*/

/**
 * Recording format page module
 */

define({
    name: 'views/recordingFormat',
    requires: [
        'core/event',
        'core/template',
        'models/camera'
    ],
    def: function viewsRecordingFormat(req) {
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
            tau.changePage('#recording-format');
        }

        /**
         * Renders page UI.
         */
        function renderView() {
            var formats = camera.getAvailableRecordingFormats(),
                currentFormat = camera.getRecordingFormat(),
                i = 0,
                len = formats.length,
                content = [],
                format = null,
                checked = false;

            for (i = 0; i < len; i += 1) {
                format = formats[i];
                checked = currentFormat === format;
                content.push(t.get('recordingFormatRow', {
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

            camera.setRecordingFormat(input.getAttribute('data-format'));
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
            page = document.getElementById('recording-format');
            formatList = document.getElementById('recording-format-list');
            bindEvents();
        }

        e.listeners({
            'views.settings.show.recordingFormat': show
        });

        return {
            init: init
        };
    }

});
