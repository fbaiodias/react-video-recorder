"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.captureThumb = void 0;

var captureThumb = function captureThumb(videoTag) {
  return new Promise(function (resolve, reject) {
    var canvas = document.createElement('canvas');
    canvas.width = videoTag.videoWidth;
    canvas.height = videoTag.videoHeight;
    canvas.getContext('2d').drawImage(videoTag, 0, // top
    0, // left
    videoTag.videoWidth, videoTag.videoHeight);
    canvas.toBlob(function (thumbnail) {
      resolve(thumbnail);
    }, 'image/jpeg');
  });
};

exports.captureThumb = captureThumb;

var getVideoInfo = function getVideoInfo(videoBlob) {
  return new Promise(function (resolve, reject) {
    var videoTag = document.createElement('video');
    videoTag.preload = 'metadata';
    videoTag.muted = true;
    videoTag.defaultMuted = true;
    videoTag.playsInline = true;
    videoTag.autoplay = true;
    var resolved = false;

    var handleTimeout = function handleTimeout() {
      resolved = true;
      resolve({
        duration: null,
        thumbnail: null
      });
      videoTag.removeEventListener && videoTag.removeEventListener('loadeddata', handleLoadedData);
      window.URL.revokeObjectURL(videoTag.src);
    };

    var timeout = setTimeout(handleTimeout, 1000);

    var handleVideoTag = function handleVideoTag(duration) {
      captureThumb(videoTag).then(function (thumbnail) {
        videoTag.pause();

        if (!resolved) {
          clearTimeout(timeout);
          resolved = true;
          resolve({
            duration: duration,
            thumbnail: thumbnail
          });
        }

        window.URL.revokeObjectURL(videoTag.src);
      })["catch"](function (err) {
        if (!resolved) {
          clearTimeout(timeout);
          resolved = true;
          reject(err);
        }
      });
    };

    var handleLoadedData = function handleLoadedData() {
      var duration = videoTag.duration * 1000;

      if (videoTag.duration === Infinity) {
        videoTag.currentTime = Number.MAX_SAFE_INTEGER;

        videoTag.ontimeupdate = function () {
          videoTag.ontimeupdate = null;
          duration = videoTag.duration * 1000;
          videoTag.currentTime = 0;
          handleVideoTag(duration);
        };
      } else {
        handleVideoTag(duration);
      }
    };

    videoTag.addEventListener('loadeddata', handleLoadedData);
    videoTag.src = window.URL.createObjectURL(videoBlob);
  });
};

var _default = getVideoInfo;
exports["default"] = _default;