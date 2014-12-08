/*global define, console, navigator, window, setTimeout*/
/*jslint regexp: true*/

/**
 * Camera model module
 */

define({
    name: 'models/camera',
    requires: [
        'core/event',
        'core/storage/localstorage',
        'helpers/date'
    ],
    def: function modelsCamera(req) {
        /*jshint maxstatements:44*/
        'use strict';

        var e = req.core.event,
            storage = req.core.storage.localstorage,
            dateHelper = req.helpers.date,

            MAX_RECORDING_TIME = 10000,
            VIDEO_LENGTH_CHECK_INTERVAL = 10,
            AUTOFOCUS_DELAY = 500,
            TAKE_PICTURE_DELAY = 100,

            PICTURE_DESTINATION_DIRECTORY = '/opt/usr/media/Images',
            VIDEO_DESTINATION_DIRECTORY = '/opt/usr/media/Videos',
            STORAGE_SETTINGS_KEY = 'settings',

            /**
             * Camera control object.
             * @type {CameraControl}
             */
            cameraControl = null,

            /**
             * Path for new picture.
             * @type {string}
             */
            picturePath = '',

            /**
             * Path for new recording.
             * @type {string}
             */
            videoPath = '',

            /**
             * Camera settings object.
             * @type {object}
             */
            cameraSettings = {},

            /**
             * Handler for video length check interval.
             * @type {number}
             */
            videoLengthCheckInterval = null,

            /**
             * Time of recording start.
             * @type {Date}
             */
            videoRecordingStartTime = null,

            /**
             * Length of recording current length (in milliseconds).
             * @type {number}
             */
            videoRecordingTime = 0,

            /**
             * Flag indicating if camera is recording or taking picture.
             * @type {boolean}
             */
            busy = false,

            /**
             * Flag indicating if camera is taking picture.
             * @type {boolean}
             */
            takingPictureInProgress = false,

            /**
             * Flag indicating if taking picture cancellation request was made.
             * @type {boolean}
             */
            takingPictureCancelRequested = false;

        /**
         * Handles camera onshutter event.
         */
        function onShutter() {
            e.fire('shutter');
        }

        /**
         * Executes when camera control is created from stream.
         * @param {CameraControl} control
         */
        function onCameraControlCreated(control) {
            cameraControl = control;
            initCameraSettings();
            e.fire('ready');
        }

        /**
         * Executes on camera control creation error.
         * @param {object} error
         */
        function onCameraControlError(error) {
            console.error(error);
            e.fire('error', {error: error});
        }

        /**
         * Registers stream that camera controls.
         * @param {LocalMediaStream} mediaStream
         */
        function registerStream(mediaStream) {
            navigator.tizCamera.createCameraControl(
                mediaStream,
                onCameraControlCreated,
                onCameraControlError
            );
        }

        /**
         * Returns true if taking picture is in progress,
         * false otherwise.
         * @return {boolean}
         */
        function isTakingPicture() {
            return takingPictureInProgress;
        }

        /**
         * Cancels taking picture process.
         */
        function cancelTakingPicture() {
            if (isTakingPicture()) {
                takingPictureInProgress = false;
                takingPictureCancelRequested = true;
                busy = false;
                e.fire('picture.canceled');
            }
        }

        /**
         * Executes when picture is ready.
         */
        function onPictureDone() {
            busy = false;
            takingPictureInProgress = false;
            e.fire('picture.done', {path: picturePath});
        }

        /**
         * Executes when error occurs during taking picture.
         * @param {object} error
         */
        function onPictureError(error) {
            busy = false;
            takingPictureInProgress = false;
            e.fire('picture.error', {error: error});
        }

        /**
         * Executes when image settings are applied.
         */
        function onImageSettingsApplied() {
            if (!takingPictureCancelRequested) {
                cameraControl.image.takePicture(onPictureDone, onPictureError);
            }
        }

        /**
         * Executes when error occurs during applying image settings.
         * @param {object} error
         */
        function onImageSettingsError(error) {
            busy = false;
            takingPictureInProgress = false;
            e.fire('picture.error', {error: error});
        }

        /**
         * Creates filename for new picture.
         * @return {string}
         */
        function createPictureFileName() {
            var currentDate = new Date(),
                pictureFormat = getPictureFormat(),
                extension = pictureFormat === 'jpeg' ? 'jpg' : pictureFormat,
                fileName = '';

            fileName = dateHelper.format(currentDate, 'yyyymmdd_HHMMSS') +
                '.' + extension;

            return fileName;
        }

        /**
         * Starts taking photo.
         */
        function startTakingPicture() {
            var settings = {},
                fileName = '';

            fileName = createPictureFileName();
            picturePath = PICTURE_DESTINATION_DIRECTORY + '/' + fileName;

            settings.fileName = fileName;
            settings.pictureFormat = getPictureFormat();
            settings.pictureSize = getPictureSize();

            if (!cameraControl) {
                cancelTakingPicture();
                return;
            }
            cameraControl.image.onshutter = onShutter;
            cameraControl.image.applySettings(
                settings,
                onImageSettingsApplied,
                onImageSettingsError
            );
        }

        /**
         * Handles autofocus success.
         */
        function onAutoFocusSuccess() {
            e.fire('autofocus.success');
            if (!takingPictureCancelRequested) {
                setTimeout(startTakingPicture, TAKE_PICTURE_DELAY);
            }

        }

        /**
         * Handles autofocus error.
         */
        function onAutoFocusFailure() {
            e.fire('autofocus.failure');
            if (!takingPictureCancelRequested) {
                setTimeout(startTakingPicture, TAKE_PICTURE_DELAY);
            }
        }

        /**
         * Takes a picture.
         * When autofocus starts, camera.autofocus event is fired.
         * When autofocus succeeds, camera.autofocus.success event is fired.
         * When autofocus fails, camera.autofocus.failure event is fired.
         * When picture is ready camera.picture.done event is fired with picture
         * path as a data. If error occurs, camera.picture.error event is fired.
         * @return {boolean} If process starts true is returned,
         * false otherwise (camera other operation is in progress).
         */
        function takePicture() {
            if (busy) {
                return false;
            }

            busy = true;
            takingPictureInProgress = true;
            takingPictureCancelRequested = false;
            e.fire('autofocus.start');
            if (cameraControl.autoFocus()) {
                setTimeout(onAutoFocusSuccess, AUTOFOCUS_DELAY);
            } else {
                setTimeout(onAutoFocusFailure, AUTOFOCUS_DELAY);
            }

            return true;
        }

        /**
         * Checks if video length is greater then MAX_RECORDING_TIME.
         * If it does, recording will be stopped.
         */
        function checkVideoLength() {
            var currentTime = new Date();

            videoRecordingTime = currentTime - videoRecordingStartTime;
            if (videoRecordingTime > MAX_RECORDING_TIME) {
                stopRecording();
            }
        }

        /**
         * Starts tracing video length.
         * When video length reaches MAX_RECORDING_TIME, recording
         * will be stopped automatically.
         */
        function startTracingVideoLength() {
            videoRecordingStartTime = new Date();
            videoLengthCheckInterval = window.setInterval(
                checkVideoLength,
                VIDEO_LENGTH_CHECK_INTERVAL
            );
        }

        /**
         * Stops tracing video length.
         */
        function stopTracingVideoLength() {
            window.clearInterval(videoLengthCheckInterval);
            videoLengthCheckInterval = null;
        }

        /**
         * Executes when recording starts successfully.
         */
        function onRecordingStartSuccess() {
            startTracingVideoLength();
            e.fire('recording.start');
        }

        /**
         * Executes when error occurs during recording start.
         * @param {object} error
         */
        function onRecordingStartError(error) {
            busy = false;
            e.fire('recording.error', {error: error});
        }

        /**
         * Executes when video settings are applied.
         */
        function onVideoSettingsApplied() {
            cameraControl.recorder.start(
                onRecordingStartSuccess,
                onRecordingStartError
            );
        }

        /**
         * Executes when error occurs during applying video settings.
         * @param {object} error
         */
        function onVideoSettingsError(error) {
            console.error('settings.error');
            busy = false;
            e.fire('recording.error', {error: error});
        }

        /**
         * Creates filename for new video.
         * @return {string}
         */
        function createVideoFileName() {
            var currentDate = new Date(),
                extension = getRecordingFormat(),
                fileName = '';

            fileName = dateHelper.format(currentDate, 'yyyymmdd_HHMMSS') +
                '.' + extension;

            return fileName;
        }

        /**
         * Starts video recording.
         * When recording is started successfully, camera.recording.start event
         * is fired. If error occurs, camera.recording.error event is fired.
         * @return {boolean} If process starts true is returned,
         * false otherwise (camera other operation is in progress).
         */
        function startRecording() {
            var settings = {},
                fileName = '';

            if (busy) {
                return false;
            }

            busy = true;
            fileName = createVideoFileName();
            videoPath = VIDEO_DESTINATION_DIRECTORY + '/' + fileName;

            settings.fileName = fileName;
            settings.recordingFormat = getRecordingFormat();

            cameraControl.recorder.applySettings(
                settings,
                onVideoSettingsApplied,
                onVideoSettingsError
            );

            return true;
        }

        /**
         * Executes when video recording stops successfully.
         */
        function onVideoRecordingStopSuccess() {
            busy = false;
            e.fire('recording.done', {path: videoPath});
            videoRecordingTime = 0;
        }

        /**
         * Executes when video recording stop fails.
         * @param {object} error
         */
        function onVideoRecordingStopError(error) {
            busy = false;
            e.fire('recording.error', {error: error});
            videoRecordingTime = 0;
        }

        /**
         * Stop video recording.
         * When recording is stopped, camera.recording.done event is fired
         * with file path as a data.
         * If error occurs camera.recording error is fired.
         * Recording will stop also if MAX_RECORDING_TIME will be reached.
         */
        function stopRecording() {
            stopTracingVideoLength();
            cameraControl.recorder.stop(onVideoRecordingStopSuccess,
                onVideoRecordingStopError
            );
        }

        /**
         * Returns current recording time in milliseconds.
         * @return {number}
         */
        function getRecordingTime() {
            return videoRecordingTime;
        }

        /**
         * Initiates camera settings.
         */
        function initCameraSettings() {
            var pictureFormats = null,
                pictureSizes = null,
                recordingFormats = null;

            cameraSettings = storage.get(STORAGE_SETTINGS_KEY);

            if (!cameraSettings) {
                cameraSettings = {};

                pictureFormats = getAvailablePictureFormats();
                cameraSettings.pictureFormat = pictureFormats[0];

                pictureSizes = getAvailablePictureSizes();
                cameraSettings.pictureSize = pictureSizes[0];

                recordingFormats = getAvailableRecordingFormats();
                cameraSettings.recordingFormat = recordingFormats[0];

                saveCameraSettings();
            }
        }

        /**
         * Saves camera settings to storage.
         */
        function saveCameraSettings() {
            storage.add(STORAGE_SETTINGS_KEY, cameraSettings);
        }

        /**
         * Returns array of available picture sizes.
         * @return {array}
         */
        function getAvailablePictureSizes() {
            return cameraControl.capabilities.pictureSizes;
        }

        /**
         * Returns array of available picture formats.
         * @return {array}
         */
        function getAvailablePictureFormats() {
            return cameraControl.capabilities.pictureFormats;
        }

        /**
         * Returns array of available recording formats.
         * @return {array}
         */
        function getAvailableRecordingFormats() {
            return cameraControl.capabilities.recordingFormats;
        }

        /**
         * Returns picture format.
         * @return {array}
         */
        function getPictureFormat() {
            return cameraSettings.pictureFormat;
        }

        /**
         * Returns recording format.
         * @return {array}
         */
        function getRecordingFormat() {
            return cameraSettings.recordingFormat;
        }

        /**
         * Returns current picture size.
         * @returns {object}
         */
        function getPictureSize() {
            return {
                width: cameraSettings.pictureSize.width,
                height: cameraSettings.pictureSize.height
            };
        }

        /**
         * Sets picture format.
         * @param {string} format
         */
        function setPictureFormat(format) {
            cameraSettings.pictureFormat = format;
            saveCameraSettings();
        }

        /**
         * Sets recording format.
         * @param {string} format
         */
        function setRecordingFormat(format) {
            cameraSettings.recordingFormat = format;
            saveCameraSettings();
        }

        /**
         * Sets picture size.
         * @param size
         */
        function setPictureSize(size) {
            cameraSettings.pictureSize = {
                width: size.width,
                height: size.height
            };
            saveCameraSettings();
        }

        /**
         * Releases camera.
         */
        function release() {
            if (isRecording()) {
                stopRecording();
            } else if (isTakingPicture()) {
                cancelTakingPicture();
            }
            busy = false;
            if (cameraControl) {
                cameraControl.release();
                cameraControl = null;
                e.fire('release');
            }
        }

        /**
         * Returns true if camera is ready to work,
         * false otherwise.
         * @return {boolean}
         */
        function isReady() {
            return cameraControl !== null;
        }

        /**
         * Returns true if camera is recording,
         * false otherwise.
         * @return {boolean}
         */
        function isRecording() {
            return !!videoLengthCheckInterval;
        }

        return {
            MAX_RECORDING_TIME: MAX_RECORDING_TIME,

            getAvailablePictureSizes: getAvailablePictureSizes,
            getPictureSize: getPictureSize,
            setPictureSize: setPictureSize,

            getAvailablePictureFormats: getAvailablePictureFormats,
            getPictureFormat: getPictureFormat,
            setPictureFormat: setPictureFormat,

            getAvailableRecordingFormats: getAvailableRecordingFormats,
            getRecordingFormat: getRecordingFormat,
            setRecordingFormat: setRecordingFormat,

            registerStream: registerStream,
            release: release,
            isReady: isReady,
            isRecording: isRecording,

            takePicture: takePicture,

            startRecording: startRecording,
            stopRecording: stopRecording,
            getRecordingTime: getRecordingTime
        };
    }
});
