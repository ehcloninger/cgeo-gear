/*global define, console, document, tau*/
/*jslint plusplus: true*/

/**
 * Settings page module
 */

define({
    name: 'views/settings',
    requires: [
        'core/event'
    ],
    def: function viewsSettings(e) {
        'use strict';

        var page = null,
            pictureSizeBtn = null,
            pictureFormatBtn = null,
            recFormatBtn = null,

            photoMode = true;

        /**
         * Handles views.settings.open event.
         */
        function open() {
            tau.changePage('#settings');
        }

        /**
         * Handles views.settings.show event.
         * @param {event} ev
         */
        function show(ev) {
            photoMode = ev.detail.photoMode;
            tau.changePage('#settings');
        }

        /**
         * Shows picture settings.
         */
        function showPictureSettings() {
            recFormatBtn.classList.add('hidden');
            pictureSizeBtn.classList.remove('hidden');
            pictureFormatBtn.classList.remove('hidden');
        }

        /**
         * Shows recording settings.
         */
        function showRecordingSettings() {
            pictureSizeBtn.classList.add('hidden');
            pictureFormatBtn.classList.add('hidden');
            recFormatBtn.classList.remove('hidden');
        }

        /**
         * Handles pagebeforeshow event.
         */
        function onPageBeforeShow() {
            if (photoMode) {
                showPictureSettings();
            } else {
                showRecordingSettings();
            }
        }

        /**
         * Handles click event on picture-size-btn.
         * @param {event} ev
         */
        function onPictureSizeBtnClick(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            e.fire('show.pictureSize');
        }

        /**
         * Handles click event on picture-format-btn.
         * @param {event} ev
         */
        function onPictureFormatBtnClick(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            e.fire('show.pictureFormat');
        }

        /**
         * Handles click event on recording-format-btn.
         * @param {event} ev
         */
        function onRecordingFormatBtnClick(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            e.fire('show.recordingFormat');
        }

        /**
         * Registers view event listeners.
         */
        function bindEvents() {
            page.addEventListener('pagebeforeshow', onPageBeforeShow);
            pictureSizeBtn.addEventListener('click', onPictureSizeBtnClick);
            pictureFormatBtn.addEventListener('click', onPictureFormatBtnClick);
            recFormatBtn.addEventListener('click', onRecordingFormatBtnClick);
        }

        /**
         * Initiates module.
         */
        function init() {
            page = document.getElementById('settings');
            pictureSizeBtn = document.getElementById('picture-size-btn');
            pictureFormatBtn = document.getElementById('picture-format-btn');
            recFormatBtn = document.getElementById('recording-format-btn');
            bindEvents();
        }

        e.listeners({
            'views.main.show.settings': show,
            'views.initPage.settings.open': open
        });

        return {
            init: init
        };
    }

});
