/*global define, console, document, navigator, window, setInterval,
 clearInterval, tau, tizen, setTimeout*/
/*jslint plusplus: true*/

/**
 * Main page module
 */

define({
    name: 'views/main',
    requires: [
        'core/event',
        'core/application',
        'models/camera',
        'helpers/adjust',
        'helpers/page',
        'helpers/date'
    ],
    def: function viewsMain(req) {
        /*jshint maxstatements:67*/
        'use strict';

        var e = req.core.event,
            camera = req.models.camera,
            adjustHelper = req.helpers.adjust,
            dateHelper = req.helpers.date,
            app = req.core.application,
            pageHelper = req.helpers.page,

            VIDEO_NETWORK_NO_SOURCE = 3,

            ERROR_FILE_WRITE = 'FILE_WRITE_ERR',

            CANNOT_ACCESS_CAMERA_MSG = 'Cannot access camera stream. ' +
                'Please close all applications that use the camera and ' +
                'open the application again.',
            CAMERA_NOT_AVAILABLE_MSG = 'Camera is not available.',
            CAMERA_ON_DEVICE_ONLY_MSG = 'Camera is supported ' +
                'on device target only.',
            NO_FREE_SPACE_MSG = 'No free space.',
            DEFAULT_ERROR_MSG = 'An error occurred.',
            PREVIEW_INIT_MAX_ATTEMPTS = 3,
            PREVIEW_INIT_ATTEMPT_TIMEOUT = 500,
            READY_STATE_HAVE_NOTHING = 0,

            page = null,
            modeBtn = null,
            settingsBtn = null,
            cameraPreview = null,
            focusContainer = null,
            focusFrame = null,
            recordProgress = null,
            recordProgressVal = null,
            recordProgressLabelVal = null,
            recordProgressLabelMax = null,
            photoMode = true,
            recording = false,
            cameraStream = null,
            alert = null,
            alertMessage = null,
            alertOk = null,

            RECORDING_INTERVAL_STEP = 100,

            recordingInterval = null,
            maxRecordingTimeSeconds = Math.floor(
                camera.MAX_RECORDING_TIME / 1000
            ),
            recordingTime = 0,
            exitInProgress = false,
            previewTapAllowed = false,
            popupExitAppOnClose = false,
            previewInitInProgress = false,
            previewInitAttemtps = 0,

            changePage = false;

        /**
         * Opens page.
         */
        function open() {
            if (camera.isReady() &&
                    cameraPreview.readyState !== READY_STATE_HAVE_NOTHING) {
                //page will be changed on 'playing' event
                //to prevent black screen blink
                changePage = true;
                cameraPreview.play();
            } else {
                tau.changePage('#main');
            }
        }

        /**
         * Pauses camera preview.
         */
        function pausePreview() {
            cameraPreview.pause();
        }

        /**
         * Handles page show event.
         */
        function onPageShow() {
            previewTapAllowed = true;
            toggleRecording(false);
            if (camera.isReady()) {
                cameraPreview.play();
            }
        }

        /**
         * Handles page hide event.
         */
        function onPageHide() {
            hideRecordingView();
            pausePreview();
        }

        /**
         * Toggles between recording/no recording state.
         * @param {boolean} forceValue
         */
        function toggleRecording(forceValue) {
            if (forceValue !== undefined) {
                recording = !!forceValue;
            } else {
                recording = !recording;
            }
        }

        /**
         * Toggles app mode photo/cam.
         */
        function toggleMode() {
            photoMode = !photoMode;
        }

        /**
         * Updates mode button text.
         */
        function updateModeBtn() {
            if (photoMode) {
                modeBtn.classList.remove('movie');
            } else {
                modeBtn.classList.add('movie');
            }
        }

        /**
         * Handles mode button click event.
         */
        function onModeBtnClick() {
            toggleMode();
            updateModeBtn();
        }

        /**
         * Handles settings button click event.
         */
        function onSettingsBtnClick() {
            e.fire('show.settings', {photoMode: photoMode});
        }

        /**
         * Takes a photo.
         */
        function takePhoto() {
            previewTapAllowed = false;
            hideNavigationBtns();

            //ensure preview is visible to prevent webkit freeze
            cameraPreview.classList.remove('hidden');
            camera.takePicture();
        }

        /**
         * Shows navigation buttons.
         */
        function showNavigationBtns() {
            modeBtn.classList.remove('hidden');
            settingsBtn.classList.remove('hidden');
        }

        /**
         * Hides navigation buttons.
         */
        function hideNavigationBtns() {
            modeBtn.classList.add('hidden');
            settingsBtn.classList.add('hidden');
        }

        /**
         * Shows record progress.
         */
        function showRecordProgress() {
            recordProgress.classList.remove('hidden');
        }

        /**
         * Hides record progress.
         */
        function hideRecordProgress() {
            recordProgress.classList.add('hidden');
        }

        /**
         * Shows recording view.
         */
        function showRecordingView() {
            hideNavigationBtns();
            showRecordProgress();
        }

        /**
         * Hides recording view.
         */
        function hideRecordingView() {
            showNavigationBtns();
            hideRecordProgress();
        }

        /**
         * Renders recording progress bar value.
         * @param {number} value
         */
        function renderRecordingProgressBarValue(value) {
            recordProgressVal.style.width = value + 'px';
        }

        /**
         * Renders recording progress bar label.
         */
        function renderRecordingProgressBarLabel() {
            var time = Math.ceil(recordingTime / 1000);

            if (time > maxRecordingTimeSeconds) {
                time = maxRecordingTimeSeconds;
            }
            recordProgressLabelVal.innerHTML =
                dateHelper.formatTime(time);
            recordProgressLabelMax.innerHTML =
                dateHelper.formatTime(maxRecordingTimeSeconds);
        }

        /**
         * Renders recording progress bar.
         */
        function renderRecordingProgressBar() {
            var parentWidth = recordProgress.clientWidth,
                width = recordingTime / camera.MAX_RECORDING_TIME * parentWidth;
            renderRecordingProgressBarValue(width);
            renderRecordingProgressBarLabel();
        }

        /**
         * Resets recording progress.
         */
        function resetRecordingProgress() {
            recordingTime = 0;
            renderRecordingProgressBar();
        }

        /**
         * Removes recording interval.
         */
        function removeRecordingInterval() {
            clearInterval(recordingInterval);
        }

        /**
         * Updates recording progress.
         */
        function updateRecordingProgress() {
            recordingTime = camera.getRecordingTime();

            renderRecordingProgressBar();
        }

        /**
         * Sets recording interval.
         */
        function setRecordingInterval() {
            recordingInterval = setInterval(
                updateRecordingProgress,
                RECORDING_INTERVAL_STEP
            );
        }

        /**
         * Starts video recording.
         */
        function startRecording() {
            previewTapAllowed = false;
            //ensure preview is visible to prevent webkit freeze.
            cameraPreview.classList.remove('hidden');
            camera.startRecording();
            resetRecordingProgress();
            showRecordingView();
        }

        /**
         * Stops video recording.
         */
        function stopRecording() {
            previewTapAllowed = false;
            camera.stopRecording();
        }

        /**
         * Starts or stops video recording.
         */
        function setRecording() {
            if (recording) {
                startRecording();
            } else {
                stopRecording();
            }
        }

        /**
         * Handles camera preview click event.
         * @param {event} ev
         */
        function onCameraPreviewClick(ev) {
            ev.preventDefault();
            ev.stopPropagation();

            if (!previewTapAllowed) {
                return;
            }

            if (photoMode) {
                takePhoto();
            } else {
                toggleRecording();
                setRecording();
            }
        }

        /**
         * Shows alert popup.
         * @param {string} message
         * @param {boolean} exit
         */
        function showAlert(message, exitAppOnClose) {
            popupExitAppOnClose = exitAppOnClose;
            alertMessage.innerHTML = message;
            tau.openPopup('#main-alert');
        }

        /**
         * Executes when preview stream is obtained.
         */
        function onPreviewStream(stream) {
            var streamUrl = window.webkitURL.createObjectURL(stream);

            previewInitAttemtps = 0;
            cameraStream = stream;
            cameraPreview.src = streamUrl;
            camera.registerStream(cameraStream);
            if (pageHelper.isPageActive(page)) {
                cameraPreview.play();
            }
        }

        /**
         * Executes if preview stream error occurs.
         * @param error
         */
        function onPreviewStreamError(error) {
            if (previewInitAttemtps < PREVIEW_INIT_MAX_ATTEMPTS) {
                //application tries to obtain camera stream up to 3 times
                //because other application may not release it yet
                window.setTimeout(requestForCameraStream,
                    PREVIEW_INIT_ATTEMPT_TIMEOUT);
            } else {
                previewInitAttemtps = 0;
                if (document.visibilityState === 'visible') {
                    showAlert(CANNOT_ACCESS_CAMERA_MSG, true);
                }
            }

        }

        /**
         * Requests for camera stream.
         */
        function requestForCameraStream() {
            previewInitAttemtps += 1;
            navigator.webkitGetUserMedia(
                {video: true, audio: true},
                onPreviewStream,
                onPreviewStreamError
            );
        }

        /**
         * Inits camera preview.
         */
        function initCameraPreview() {
            if (previewInitInProgress) {
                return;
            }

            previewInitInProgress = true;
            requestForCameraStream();
        }

        /**
         * Unregisters listeners for click events.
         */
        function unbindCameraReadyEvents() {
            modeBtn.removeEventListener('click', onModeBtnClick);
            settingsBtn.removeEventListener('click', onSettingsBtnClick);
            cameraPreview.removeEventListener('click', onCameraPreviewClick);
            recordProgress.removeEventListener('click', onCameraPreviewClick);
        }

        /**
         * Registers listeners for click events.
         */
        function bindCameraReadyEvents() {
            modeBtn.addEventListener('click', onModeBtnClick);
            settingsBtn.addEventListener('click', onSettingsBtnClick);
            cameraPreview.addEventListener('click', onCameraPreviewClick);
            recordProgress.addEventListener('click', onCameraPreviewClick);
        }

        /**
         * Returns true if application is launched on emulator,
         * false otherwise.
         * @return {boolean}
         */
        function isDeviceEmulated() {
            return !!(navigator.platform &&
                navigator.platform.indexOf('emulated') !== -1);
        }

        /**
         * Handles camera.error event.
         * @param {event} ev
         */
        function onCameraError(ev) {
            var error = ev.detail.error,
                message = '';

            previewInitInProgress = false;
            if (error.code === 0) {
                message = CAMERA_NOT_AVAILABLE_MSG;
                if (isDeviceEmulated()) {
                    message += ' ' + CAMERA_ON_DEVICE_ONLY_MSG;
                }
            } else {
                message = CAMERA_NOT_AVAILABLE_MSG;
            }

            showAlert(message, true);
        }

        /**
         * Handles camera.realease event.
         */
        function onCameraRelease() {
            unbindCameraReadyEvents();
            previewTapAllowed = false;
        }

        /**
         * Handles camera.ready event.
         */
        function onCameraReady() {
            previewInitInProgress = false;
            if (pageHelper.isPageActive(page)) {
                cameraPreview.play();
            }
        }

        /**
         * Handles camera.shutter event.
         */
        function onCameraShutter() {
            hideAutoFocus();
            showStatusMessage('Processing...');
        }

        /**
         * Shows autofocus frame.
         */
        function showAutoFocus() {
            focusContainer.classList.remove('hidden');
            focusFrame.classList.add('autofocus-animation');
        }

        /**
         * Hides autofocus frame.
         */
        function hideAutoFocus() {
            var classList = focusFrame.classList;

            focusContainer.classList.add('hidden');
            classList.remove('autofocus-animation');
            classList.remove('autofocus-success');
            classList.remove('autofocus-failure');
        }

        /**
         * Handles camera.autofocus.start event.
         */
        function onAutoFocusStart() {
            showAutoFocus();
        }

        /**
         * Handles camera.autofocus.success event.
         */
        function onAutoFocusSuccess() {
            pausePreview();
            focusFrame.classList.add('autofocus-success');
        }

        /**
         * Handles camera.autofocus.failure event.
         */
        function onAutoFocusFailure() {
            pausePreview();
            focusFrame.classList.add('autofocus-failure');
        }

        /**
         * Handles camera.picture.done event.
         * @param {event} ev
         */
        function onPictureDone(ev) {
            var path = ev.detail.path;
            hideAutoFocus();
            e.fire('show.preview', {picture: path});
        }

        /**
         * Handles models.camera.picture.canceled event.
         * Executes when picture taking is canceled.
         */
        function onPictureCanceled() {
            hideStatusMessage();
            hideAutoFocus();
        }

        /**
         * Handles camera.picture.error event.
         * @param {object} error
         */
        function onPictureError(error) {
            console.error('picture error', error);
            hideAutoFocus();
            hideStatusMessage();
        }

        /**
         * Handles camera.recording.start event.
         */
        function onRecordingStart() {
            setRecordingInterval();
            toggleRecording(true);
            previewTapAllowed = true;
        }

        /**
         * Handles camera.recording.done event.
         * @param {event} ev
         */
        function onRecordingDone(ev) {
            var path = ev.detail.path;

            removeRecordingInterval();
            toggleRecording(false);
            updateRecordingProgress();
            if (!exitInProgress) {
                e.fire('show.preview', {video: path});
            }
        }

        /**
         * Handles camera.recording.error event.
         * @param {CustomEvent} ev
         */
        function onRecordingError(ev) {
            var error = ev.detail.error;

            if (error === ERROR_FILE_WRITE) {
                showAlert(NO_FREE_SPACE_MSG);
            } else {
                showAlert(DEFAULT_ERROR_MSG);
            }

            hideRecordingView();
            removeRecordingInterval();
            toggleRecording(false);
        }

        /**
         * Prevents default action for specified event.
         * @param {event} e
         */
        function preventEventDefault(e) {
            e.preventDefault();
        }

        /**
         * Sets and shows status message.
         * @param {string} message
         */
        function showStatusMessage(message) {
            var content = document.querySelector('#message .ui-popup-content'),
                container = null;

            content.innerHTML = message;
            tau.openPopup('#message', {transition: 'none'});
            container = page.getElementsByClassName('ui-popup-background')[0];
            if (container) {
                container.removeEventListener('touchstart',
                    preventEventDefault);
                container.addEventListener('touchstart', preventEventDefault);
            }

        }

        /**
         * Clears and hides status message.
         */
        function hideStatusMessage() {
            if (window.location.hash === '#?popup=true') {
                tau.closePopup({transition: 'none'});
            }
        }

        /**
         * Handles playing event on video element.
         * @param {event} ev
         */
        function onVideoCanPlay(ev) {
            setTimeout(function () {
                adjustHelper.adjustElement(ev.target);
            }, 0);

            cameraPreview.classList.remove('hidden');
            if (changePage) {
                changePage = false;
                tau.changePage('#main');
            }
        }

        /**
         * Handles canplay event on video element.
         */
        function onVideoPlaying() {
            bindCameraReadyEvents();
            showNavigationBtns();
        }

        /**
         * Handles camera preview error.
         * @param {event} ev
         */
        function onCameraPreviewError(ev) {
            var target = ev.target;
            if (document.visibilityState === 'visible') {
                if (target.networkState === VIDEO_NETWORK_NO_SOURCE) {
                    showAlert(CANNOT_ACCESS_CAMERA_MSG, true);
                } else {
                    console.error('Camera preview error');
                    console.error(ev);
                }
            }
        }

        /**
         * Handles click event on alert OK button.
         */
        function closeAlert() {
            if (popupExitAppOnClose) {
                app.exit();
            } else {
                tau.closePopup('#main-alert');
            }
        }

        /**
         * Registers view event listeners.
         */
        function bindEvents() {
            previewTapAllowed = true;
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            cameraPreview.addEventListener('canplay', onVideoCanPlay);
            cameraPreview.addEventListener('playing', onVideoPlaying);
            cameraPreview.addEventListener('error', onCameraPreviewError);
            alertOk.addEventListener('click', closeAlert);
            alert.addEventListener('popuphide', closeAlert);
        }

        /**
         * Function called when application visibility state changes
         * (document.visibilityState changed to 'visible' or 'hidden').
         */
        function visibilityChange() {
            if (document.visibilityState !== 'visible') {
                if (camera.isReady()) {
                    pausePreview();
                    camera.release();
                    cameraStream.stop();
                }
            } else {
                previewTapAllowed = true;
                if (!cameraStream || cameraStream.ended) {
                    initCameraPreview();
                } else if (!camera.isReady()) {
                    camera.registerStream(cameraStream);
                }
            }
        }

        /**
         * Handles application exit event.
         */
        function onApplicationExit() {
            exitInProgress = true;
            if (camera.isReady()) {
                pausePreview();
                camera.release();
                cameraStream.stop();
            }
        }

        /**
         * Handles application.state.background event.
         */
        function onApplicationStateBackground() {
            cameraPreview.classList.add('hidden');
        }

        /**
         * Handles application.state.foreground event.
         */
        function onApplicationStateForeground() {
            if (camera.isReady()) {
                cameraPreview.classList.remove('hidden');
            }
        }

        /**
         * Initiates module.
         */
        function init() {
            page = document.getElementById('main');
            modeBtn = document.getElementById('mode-btn');
            settingsBtn = document.getElementById('settings-btn');
            cameraPreview = document.getElementById('camera-preview');
            focusContainer = document.getElementById('focus-container');
            focusFrame = document.getElementById('focus-frame');
            recordProgress = document.getElementById('record-progress');
            recordProgressVal = document.getElementById('record-progress-val');
            recordProgressLabelVal =
                document.getElementById('record-progress-label-val');
            recordProgressLabelMax =
                document.getElementById('record-progress-label-max');
            alert = document.getElementById('main-alert');
            alertMessage = document.getElementById('main-alert-message');
            alertOk = document.getElementById('main-alert-ok');
            bindEvents();
            updateModeBtn();
            initCameraPreview();
        }

        e.listeners({
            'views.initPage.application.exit': onApplicationExit,

            'models.camera.ready': onCameraReady,
            'models.camera.release': onCameraRelease,
            'models.camera.error': onCameraError,

            'models.camera.shutter': onCameraShutter,
            'models.camera.picture.done': onPictureDone,
            'models.camera.picture.error': onPictureError,
            'models.camera.picture.canceled': onPictureCanceled,
            'models.camera.autofocus.start': onAutoFocusStart,
            'models.camera.autofocus.success': onAutoFocusSuccess,
            'models.camera.autofocus.failure': onAutoFocusFailure,

            'models.camera.recording.start': onRecordingStart,
            'models.camera.recording.done': onRecordingDone,
            'models.camera.recording.error': onRecordingError,

            'views.initPage.visibility.change': visibilityChange,
            'views.initPage.application.state.background':
                onApplicationStateBackground,
            'views.initPage.application.state.foreground':
                onApplicationStateForeground,
            'views.initPage.main.open': open
        });

        return {
            init: init
        };
    }

});
