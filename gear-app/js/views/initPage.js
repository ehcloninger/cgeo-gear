/*global define, console, window, document, history, tizen*/

/**
 * Init page module
 */

define({
    name: 'views/initPage',
    requires: [
        'core/event',
        'core/systeminfo',
        'core/application',
        'views/main',
        'views/settings',
        'views/preview',
        'views/pictureSize',
        'views/pictureFormat',
        'views/recordingFormat'
    ],
    def: function viewsInitPage(req) {
        'use strict';

        var app = req.core.application,
            e = req.core.event,
            sysInfo = req.core.systeminfo;

        /**
         * Handles hardware keys tap event.
         * @param {event} ev
         */
        function onHardwareKeysTap(ev) {
            var keyName = ev.keyName,
                page = document.getElementsByClassName('ui-page-active')[0],
                pageid = (page && page.id) || '';

            if (keyName === 'back') {
                if (pageid === 'main') {
                    e.fire('application.exit');
                    window.setTimeout(function appCloseTimeout() {
                        app.exit();
                    }, 100);
                } else if (pageid === 'preview' || pageid === 'settings') {
                    e.fire('main.open');
                } else if (pageid === 'picture-size' ||
                    pageid === 'picture-format' ||
                    pageid === 'recording-format') {
                    e.fire('settings.open');
                } else {
                    history.back();
                }
            }
        }

        /**
         * Handles visibilitychange event.
         * @param {event} ev
         */
        function onVisibilityChange(ev) {
            e.fire('visibility.change', ev);
        }

        /**
         * Handles window unload event.
         */
        function onUnload() {
            e.fire('application.exit');
        }

        /**
         * Handler onLowBattery state.
         */
        function onLowBattery() {
            app.exit();
        }

        /**
         * Handles window blur event.
         */
        function onBlur() {
            e.fire('application.state.background');
        }

        /**
         * Handles window focus event.
         */
        function onFocus() {
            e.fire('application.state.foreground');
        }

        /**
         * Registers module event listeners.
         */
        function bindEvents() {
            document.addEventListener('tizenhwkey', onHardwareKeysTap);
            document.addEventListener('visibilitychange', onVisibilityChange);
            window.addEventListener('unload', onUnload);
            window.addEventListener('blur', onBlur);
            window.addEventListener('focus', onFocus);
            sysInfo.listenBatteryLowState();
        }

        /**
         * Initiates module.
         */
        function init() {
            // bind events to page elements
            bindEvents();
            sysInfo.checkBatteryLowState();
        }

        e.listeners({
            'core.systeminfo.battery.low': onLowBattery
        });

        return {
            init: init
        };
    }

});
