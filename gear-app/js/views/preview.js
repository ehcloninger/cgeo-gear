/*global define, console, document, tau, Math, alert, window, tizen,
setTimeout*/
/*jslint plusplus: true*/

/**
 * Settings page module
 */

define({
    name: 'views/preview',
    requires: [
        'core/event',
        'models/camera',
        'helpers/adjust',
        'helpers/page',
        'helpers/date',
        'helpers/dom'
    ],
    def: function viewsPreview(req) {
        'use strict';

        var e = req.core.event,
            camera = req.models.camera,
            adjustHelper = req.helpers.adjust,
            pageHelper = req.helpers.page,
            dateHelper = req.helpers.date,
            domHelper = req.helpers.dom,

            page = null,
            picture = null,
            video = null,
            foreground = null,
            progressTapArea = null,
            progressLabelVal = null,
            progressLabelMax = null,
            progressVal = null,
            progress = null,
            alertMessage = null,
            alertOk = null,
            maxRecordingTimeSeconds = Math.floor(
                camera.MAX_RECORDING_TIME / 1000
            ),

            videoPlayState = false,
            previewPictureMode = false,
            blockProgressTapAction = false,

            CLEAR_PROGRESS_BAR_TIMEOUT = 75;

        /**
         * Formats video time.
         * @param {number} time
         * @return {string}
         */
        function formatVideoTime(time) {
            time = time > maxRecordingTimeSeconds ?
                maxRecordingTimeSeconds : time;
            return dateHelper.formatTime(time);
        }

        /**
         * Handles views.settings.show event.
         * @param {event} ev
         */
        function show(ev) {
            var detail = ev.detail;

            progressTapArea.classList.add('hidden');
            foreground.classList.add('hidden');
            video.classList.add('hidden');
            picture.classList.add('hidden');

            if (detail.picture) {
                previewPictureMode = true;
                picture.src = detail.picture;

            } else if (detail.video) {
                previewPictureMode = false;
                video.src = detail.video;

            }
            tau.changePage('#preview');
        }

        /**
         * Toggles video preview play state.
         */
        function toggleVideoPlayState() {
            videoPlayState = !videoPlayState;
        }

        /**
         * Starts preview playing.
         */
        function playPreview() {
            foreground.classList.remove('paused');
            video.play();
        }

        /**
         * Pauses preview playing.
         */
        function pausePreview() {
            foreground.classList.add('paused');
            video.pause();
        }

        /**
         * Forces webkit to redraw video preview element.
         */
        function forceRedrawVideoPreview() {
            var offset = null;

            video.style.display = 'none';
            offset = video.offsetHeight; // only reference is required
            video.style.display = 'block';
        }

        /**
         * Handles visibility.change event.
         */
        function onVisibilityChange() {
            if (pageHelper.isPageActive(page)) {
                videoPlayState = false;
                pausePreview();
                blockProgressTapAction = false;
                //force to redraw video, fixes play/pause toggle disappearance
                forceRedrawVideoPreview();
            }
        }

        /**
         * Handles click event on video element.
         */
        function onForegroundClick() {
            toggleVideoPlayState();
            if (videoPlayState) {
                playPreview();
            } else {
                pausePreview();
            }
        }

        /**
         * Handles load event on image.
         * @param {event} ev
         */
        function onPictureLoaded(ev) {
            if (previewPictureMode) {
                adjustHelper.adjustElement(ev.target);
                picture.classList.remove('hidden');
            }
        }

        /**
         * Resets video.
         */
        function resetVideo() {
            video.pause();
            video.currentTime = 0;
            foreground.classList.add('paused');
            videoPlayState = false;
        }

        /**
         * Inits preview progress bar.
         * @param {number} duration
         */
        function initProgressBar(duration) {
            var formattedDuration = formatVideoTime(duration);
            progressLabelVal.innerHTML = formatVideoTime(0);
            progressLabelMax.innerHTML = formattedDuration +
                (formattedDuration === '1' ? ' sec' : ' secs');
            progressVal.style.width = '0';
            progressTapArea.classList.remove('hidden');
        }

        /**
         * Handles canplaythrough event on video element.
         * @param {event} ev
         */
        function onVideoCanPlayThrough(ev) {
            if (!previewPictureMode) {
                adjustHelper.adjustElement(ev.target);
                initProgressBar(ev.srcElement.duration);
                foreground.classList.remove('hidden');
                video.classList.remove('hidden');
                foreground.classList.add('paused');
                videoPlayState = false;
            }
        }

        /**
         * Handles ended event on video element.
         */
        function onVideoEnded() {
            resetVideo();
        }

        /**
         * Handles timeupdate event on video element.
         * @param {event} ev
         */
        function onTimeUpdate(ev) {
            var max = ev.target.duration,
                val = ev.target.currentTime;
            progressLabelVal.innerHTML = formatVideoTime(val);

            // val equal 0 comes immediately after displaying last frame
            // timeout is added to display fully loaded progress bar for 75 ms
            if (val === 0) {
                setTimeout(
                    function clearProgressBar() {
                        progressVal.style.width = '0%';
                    }, CLEAR_PROGRESS_BAR_TIMEOUT
                );
            } else {
                progressVal.style.width =
                    (max === 0 ? 0 : val / max * 100) + '%';
            }
        }

        /**
         * Shows alert popup.
         * @param {string} message
         */
        function showAlert(message) {
            alertMessage.innerHTML = message;
            tau.openPopup('#preview-alert');
        }

        /**
         * Hides alert popup.
         */
        function hideAlert() {
            tau.closePopup('#preview-alert');
        }

        /**
         * Handles video error event.
         */
        function onVideoError() {
            showAlert('Recording cannot be loaded into preview.');
        }

        /**
         * Handles hide event on page.
         */
        function onPageHide() {
            video.pause();
        }

        /**
         * Handles tap on video progress bar.
         * @param {event} ev
         */
        function onVideoProgressTap(ev) {
            var width = progressTapArea.offsetWidth,
                left = progressTapArea.offsetLeft,
                offsetPosition = ev.targetTouches[0].pageX - left,
                progressValue = 0;

            if (ev.touches.length > 1 || blockProgressTapAction) {
                blockProgressTapAction = true;
                return;
            }

            ev.preventDefault();
            ev.stopPropagation();

            if (width && video.duration && offsetPosition < width) {
                progressValue = offsetPosition / width;
                video.currentTime = progressValue * video.duration;
            }
        }

        /**
         * Handles tap end on video progress bar.
         * @param {event} ev
         */
        function onVideoProgressTapEnd(ev) {
            var touches = ev.touches,
                length = touches.length,
                i = 0,
                target = null,
                touchOutsideProgressArea = false;

            for (i = 0; i < length; i += 1) {
                target = touches[i].target;
                if (!domHelper.isDescendant(target, progressTapArea) &&
                        target !== progressTapArea) {
                    touchOutsideProgressArea = true;
                    break;
                }
            }

            if (touchOutsideProgressArea) {
                blockProgressTapAction = false;
            } else {
                blockProgressTapAction = length > 0;
            }
        }

        /**
         * Handles click event on alert OK button.
         */
        function onAlertOkClick() {
            hideAlert();
        }

        /**
         * Registers view event listeners.
         */
        function bindEvents() {
            page.addEventListener('pagehide', onPageHide);
            foreground.addEventListener('click', onForegroundClick);
            video.addEventListener('canplaythrough', onVideoCanPlayThrough);
            video.addEventListener('ended', onVideoEnded);
            video.addEventListener('timeupdate', onTimeUpdate);
            video.addEventListener('error', onVideoError);
            picture.addEventListener('load', onPictureLoaded);
            progressTapArea.addEventListener('touchstart', onVideoProgressTap);
            progressTapArea.addEventListener('touchmove', onVideoProgressTap);
            progressTapArea.addEventListener('touchend', onVideoProgressTapEnd);
            alertOk.addEventListener('click', onAlertOkClick);
        }

        /**
         * Initiates module.
         */
        function init() {
            page = document.getElementById('preview');
            video = document.getElementById('preview-video');
            picture = document.getElementById('preview-picture');
            foreground = document.getElementById('preview-foreground');
            progressTapArea =
                document.getElementById('preview-progress-tap-area');
            progressLabelVal =
                document.getElementById('preview-progress-label-val');
            progressLabelMax =
                document.getElementById('preview-progress-label-max');
            progressVal = document.getElementById('preview-progress-val');
            progress = document.getElementById('preview-progress');
            alertMessage = document.getElementById('preview-alert-message');
            alertOk = document.getElementById('preview-alert-ok');

            bindEvents();
        }

        e.listeners({
            'views.main.show.preview': show,
            'views.initPage.visibility.change': onVisibilityChange
        });

        return {
            init: init
        };
    }

});
