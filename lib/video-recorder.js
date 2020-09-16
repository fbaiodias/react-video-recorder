"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireWildcard(require("styled-components"));

var _unsupportedView = _interopRequireDefault(require("./defaults/unsupported-view"));

var _errorView = _interopRequireDefault(require("./defaults/error-view"));

var _disconnectedView = _interopRequireDefault(require("./defaults/disconnected-view"));

var _loadingView = _interopRequireDefault(require("./defaults/loading-view"));

var _renderActions = _interopRequireDefault(require("./defaults/render-actions"));

var _getVideoInfo = _interopRequireWildcard(require("./get-video-info"));

var _customErrors = require("./custom-errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MIME_TYPES = ['video/webm;codecs="vp8,opus"', 'video/webm;codecs=h264', 'video/webm;codecs=vp9', 'video/webm'];
var CONSTRAINTS = {
  audio: true,
  video: true
};

var Wrapper = _styledComponents["default"].div.withConfig({
  displayName: "video-recorder__Wrapper",
  componentId: "sc-7k20rv-0"
})(["position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;overflow:visible;min-height:300px;color:white;box-sizing:border-box;*{box-sizing:inherit;}"]);

var CameraView = _styledComponents["default"].div.withConfig({
  displayName: "video-recorder__CameraView",
  componentId: "sc-7k20rv-1"
})(["width:100%;height:100%;"]);

var Video = _styledComponents["default"].video.withConfig({
  displayName: "video-recorder__Video",
  componentId: "sc-7k20rv-2"
})(["position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);min-height:100%;min-width:100%;width:100%;height:100%;object-fit:cover;", ";", ";"], function (props) {
  return props.isFlipped && (0, _styledComponents.css)(["transform:translate(-50%,-50%) scaleX(-1);"]);
}, function (props) {
  return props.onClick && (0, _styledComponents.css)(["cursor:pointer;"]);
});

var VideoRecorder = /*#__PURE__*/function (_Component) {
  _inherits(VideoRecorder, _Component);

  var _super = _createSuper(VideoRecorder);

  function VideoRecorder() {
    var _this;

    _classCallCheck(this, VideoRecorder);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "videoInput", /*#__PURE__*/_react["default"].createRef());

    _defineProperty(_assertThisInitialized(_this), "timeSinceInactivity", 0);

    _defineProperty(_assertThisInitialized(_this), "state", {
      isRecording: false,
      isCameraOn: false,
      isConnecting: false,
      isReplayingVideo: false,
      isReplayVideoMuted: true,
      thereWasAnError: false,
      error: null,
      streamIsReady: false,
      isInlineRecordingSupported: null,
      isVideoInputSupported: null,
      stream: undefined
    });

    _defineProperty(_assertThisInitialized(_this), "turnOnCamera", function () {
      if (_this.props.onTurnOnCamera) {
        _this.props.onTurnOnCamera();
      }

      _this.setState({
        isConnecting: true,
        isReplayingVideo: false,
        thereWasAnError: false,
        error: null
      });

      var fallbackContraints = {
        audio: true,
        video: true
      };
      navigator.mediaDevices.getUserMedia(_this.props.constraints)["catch"](function (err) {
        // there's a bug in chrome in some windows computers where using `ideal` in the constraints throws a NotReadableError
        if (err.name === 'NotReadableError' || err.name === 'OverconstrainedError') {
          console.warn("Got ".concat(err.name, ", trying getUserMedia again with fallback constraints"));
          return navigator.mediaDevices.getUserMedia(fallbackContraints);
        }

        throw err;
      }).then(_this.handleSuccess)["catch"](_this.handleError);
    });

    _defineProperty(_assertThisInitialized(_this), "turnOffCamera", function () {
      if (_this.props.onTurnOffCamera) {
        _this.props.onTurnOffCamera();
      }

      _this.stream && _this.stream.getTracks().forEach(function (stream) {
        return stream.stop();
      });

      _this.setState({
        isCameraOn: false
      });

      clearInterval(_this.inactivityTimer);
    });

    _defineProperty(_assertThisInitialized(_this), "handleSuccess", function (stream) {
      _this.stream = stream;

      _this.setState({
        isCameraOn: true,
        stream: stream
      });

      if (_this.props.onCameraOn) {
        _this.props.onCameraOn();
      }

      if (window.URL) {
        _this.cameraVideo.srcObject = stream;
      } else {
        _this.cameraVideo.src = stream;
      } // there is probably a better way
      // but this makes sure the start recording button
      // gives the stream a couple miliseconds to be ready


      setTimeout(function () {
        _this.setState({
          isConnecting: false,
          streamIsReady: true
        });
      }, 200);
    });

    _defineProperty(_assertThisInitialized(_this), "handleError", function (err) {
      var onError = _this.props.onError;
      console.error('Captured error', err);
      clearTimeout(_this.timeLimitTimeout);

      if (onError) {
        onError(err);
      }

      _this.setState({
        isConnecting: _this.state.isConnecting && false,
        isRecording: false,
        thereWasAnError: true,
        error: err
      });

      if (_this.state.isCameraOn) {
        _this.turnOffCamera();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "handleDataIssue", function (event) {
      var error = new _customErrors.ReactVideoRecorderDataIssueError(event);
      console.error(error.message, event);

      _this.handleError(error);

      return false;
    });

    _defineProperty(_assertThisInitialized(_this), "getMimeType", function () {
      if (_this.props.mimeType) {
        return _this.props.mimeType;
      }

      var mimeType = window.MediaRecorder.isTypeSupported ? MIME_TYPES.find(window.MediaRecorder.isTypeSupported) : 'video/webm';
      return mimeType || '';
    });

    _defineProperty(_assertThisInitialized(_this), "isDataHealthOK", function (event) {
      if (!event.data) return _this.handleDataIssue(event);
      var chunkSize = _this.props.chunkSize;
      var dataCheckInterval = 2000 / chunkSize; // in some browsers (FF/S), data only shows up
      // after a certain amount of time ~everyt 2 seconds

      var blobCount = _this.recordedBlobs.length;

      if (blobCount > dataCheckInterval && blobCount % dataCheckInterval === 0) {
        var blob = new window.Blob(_this.recordedBlobs, {
          type: _this.getMimeType()
        });
        if (blob.size <= 0) return _this.handleDataIssue(event);
      }

      return true;
    });

    _defineProperty(_assertThisInitialized(_this), "tryToUnmuteReplayVideo", function () {
      var video = _this.replayVideo;
      video.muted = false;
      var playPromise = video.play();

      if (!playPromise) {
        video.muted = true;
        return;
      }

      playPromise.then(function () {
        _this.setState({
          isReplayVideoMuted: false
        }); // fixes bug where seeking control during autoplay is not available until the video is almost completely played through


        if (_this.props.replayVideoAutoplayAndLoopOff) {
          video.pause();
          video.loop = false;
        }
      })["catch"](function (err) {
        console.warn('Could not autoplay replay video', err);
        video.muted = true;
        return video.play();
      })["catch"](function (err) {
        console.warn('Could play muted replay video after failed autoplay', err);
      });
    });

    _defineProperty(_assertThisInitialized(_this), "handleDataAvailable", function (event) {
      if (_this.isDataHealthOK(event)) {
        _this.recordedBlobs.push(event.data);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "handleStopRecording", function () {
      if (_this.props.onStopRecording) {
        _this.props.onStopRecording();
      }

      if (!_this.mediaRecorder) {
        _this.handleError(new _customErrors.ReactVideoRecorderMediaRecorderUnavailableError());

        return;
      }

      _this.mediaRecorder.stop();
    });

    _defineProperty(_assertThisInitialized(_this), "handlePauseRecording", function () {
      if (_this.props.onPauseRecording) {
        _this.props.onPauseRecording();
      }

      if (!_this.mediaRecorder) {
        _this.handleError(new _customErrors.ReactVideoRecorderMediaRecorderUnavailableError());

        return;
      }

      _this.mediaRecorder.pause();
    });

    _defineProperty(_assertThisInitialized(_this), "handleResumeRecording", function () {
      if (_this.props.onResumeRecording) {
        _this.props.onResumeRecording();
      }

      if (!_this.mediaRecorder) {
        _this.handleError(new _customErrors.ReactVideoRecorderMediaRecorderUnavailableError());

        return;
      }

      _this.mediaRecorder.resume();
    });

    _defineProperty(_assertThisInitialized(_this), "handleStartRecording", function () {
      if (_this.props.onStartRecording) {
        _this.props.onStartRecording();
      }

      _this.setState({
        isRunningCountdown: true,
        isReplayingVideo: false
      });

      setTimeout(function () {
        return _this.startRecording();
      }, _this.props.countdownTime);
    });

    _defineProperty(_assertThisInitialized(_this), "startRecording", function () {
      (0, _getVideoInfo.captureThumb)(_this.cameraVideo).then(function (thumbnail) {
        _this.thumbnail = thumbnail;
        _this.recordedBlobs = [];
        var options = {
          mimeType: _this.getMimeType()
        };

        try {
          _this.setState({
            isRunningCountdown: false,
            isRecording: true
          });

          _this.startedAt = new Date().getTime();
          _this.mediaRecorder = new window.MediaRecorder(_this.stream, options);

          _this.mediaRecorder.addEventListener('stop', _this.handleStop);

          _this.mediaRecorder.addEventListener('error', _this.handleError);

          _this.mediaRecorder.addEventListener('dataavailable', _this.handleDataAvailable);

          var _this$props = _this.props,
              timeLimit = _this$props.timeLimit,
              chunkSize = _this$props.chunkSize,
              dataAvailableTimeout = _this$props.dataAvailableTimeout;

          _this.mediaRecorder.start(chunkSize); // collect 10ms of data


          if (timeLimit) {
            _this.timeLimitTimeout = setTimeout(function () {
              _this.handleStopRecording();
            }, timeLimit);
          } // mediaRecorder.ondataavailable should be called every 10ms,
          // as that's what we're passing to mediaRecorder.start() above


          if (Number.isInteger(dataAvailableTimeout)) {
            setTimeout(function () {
              if (_this.recordedBlobs.length === 0) {
                _this.handleError(new _customErrors.ReactVideoRecorderDataAvailableTimeoutError(dataAvailableTimeout));
              }
            }, dataAvailableTimeout);
          }
        } catch (err) {
          console.error("Couldn't create MediaRecorder", err, options);

          _this.handleError(err);
        }
      });
    });

    _defineProperty(_assertThisInitialized(_this), "handleStop", function (event) {
      var endedAt = new Date().getTime();

      if (!_this.recordedBlobs || _this.recordedBlobs.length <= 0) {
        var error = new _customErrors.ReactVideoRecorderRecordedBlobsUnavailableError(event);
        console.error(error.message, event);

        _this.handleError(error);

        return;
      }

      clearTimeout(_this.timeLimitTimeout);
      var videoBlob = _this.recordedBlobs.length === 1 ? _this.recordedBlobs[0] : new window.Blob(_this.recordedBlobs, {
        type: _this.getMimeType()
      });
      var thumbnailBlob = _this.thumbnail;
      var startedAt = _this.startedAt;
      var duration = endedAt - startedAt; // if this gets executed too soon, the last chunk of data is lost on FF

      _this.mediaRecorder.ondataavailable = null;

      _this.setState({
        isRecording: false,
        isReplayingVideo: true,
        isReplayVideoMuted: true,
        videoBlob: videoBlob,
        videoUrl: window.URL.createObjectURL(videoBlob)
      });

      _this.turnOffCamera();

      _this.props.onRecordingComplete(videoBlob, startedAt, thumbnailBlob, duration);
    });

    _defineProperty(_assertThisInitialized(_this), "handleVideoSelected", function (e) {
      if (_this.state.isReplayingVideo) {
        _this.setState({
          isReplayingVideo: false
        });
      }

      var files = e.target.files || e.dataTransfer.files;
      if (files.length === 0) return;
      var startedAt = new Date().getTime();
      var video = files[0];
      e.target.value = null;
      var extension = video.type === 'video/quicktime' ? 'mov' : undefined;
      (0, _getVideoInfo["default"])(video).then(function (_ref) {
        var duration = _ref.duration,
            thumbnail = _ref.thumbnail;

        _this.setState({
          isRecording: false,
          isReplayingVideo: true,
          isReplayVideoMuted: true,
          videoBlob: video,
          videoUrl: window.URL.createObjectURL(video)
        });

        _this.props.onRecordingComplete(video, startedAt, thumbnail, duration, extension);
      })["catch"](function (err) {
        _this.handleError(err);
      });
    });

    _defineProperty(_assertThisInitialized(_this), "handleOpenVideoInput", function () {
      if (_this.props.onOpenVideoInput) {
        _this.props.onOpenVideoInput();
      }

      _this.videoInput.current.value = null;

      _this.videoInput.current.click();
    });

    _defineProperty(_assertThisInitialized(_this), "handleStopReplaying", function () {
      if (_this.props.onStopReplaying) {
        _this.props.onStopReplaying();
      }

      if (_this.props.useVideoInput && _this.props.isOnInitially) {
        return _this.handleOpenVideoInput();
      }

      _this.setState({
        isReplayingVideo: false
      });

      if (_this.state.isInlineRecordingSupported && _this.props.isOnInitially) {
        _this.turnOnCamera();
      } else if (_this.state.isVideoInputSupported && _this.props.isOnInitially) {
        _this.handleOpenVideoInput();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "handleReplayVideoClick", function () {
      if (_this.replayVideo.paused && !_this.props.showReplayControls) {
        _this.replayVideo.play();
      } // fixes bug where seeking control during autoplay is not available until the video is almost completely played through


      if (!_this.props.replayVideoAutoplayAndLoopOff) {
        _this.setState({
          isReplayVideoMuted: !_this.state.isReplayVideoMuted
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "handleDurationChange", function () {
      if (_this.props.showReplayControls) {
        _this.replayVideo.currentTime = 1000000;
      }
    });

    return _this;
  }

  _createClass(VideoRecorder, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var isInlineRecordingSupported = !!window.MediaSource && !!window.MediaRecorder && !!navigator.mediaDevices;
      var isVideoInputSupported = document.createElement('input').capture !== undefined;

      if (isInlineRecordingSupported) {
        this.mediaSource = new window.MediaSource();
      }

      this.setState({
        isInlineRecordingSupported: isInlineRecordingSupported,
        isVideoInputSupported: isVideoInputSupported
      }, function () {
        if (_this2.props.useVideoInput && _this2.props.isOnInitially) {
          _this2.handleOpenVideoInput();
        } else if (_this2.state.isInlineRecordingSupported && _this2.props.isOnInitially) {
          _this2.turnOnCamera();
        } else if (_this2.state.isVideoInputSupported && _this2.props.isOnInitially) {
          _this2.handleOpenVideoInput();
        }
      });
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      if (this.replayVideo && this.state.isReplayingVideo && !prevState.isReplayingVideo) {
        this.tryToUnmuteReplayVideo();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.turnOffCamera();
    }
  }, {
    key: "renderCameraView",
    value: function renderCameraView() {
      var _this3 = this;

      var _this$props2 = this.props,
          showReplayControls = _this$props2.showReplayControls,
          replayVideoAutoplayAndLoopOff = _this$props2.replayVideoAutoplayAndLoopOff,
          renderDisconnectedView = _this$props2.renderDisconnectedView,
          renderVideoInputView = _this$props2.renderVideoInputView,
          renderUnsupportedView = _this$props2.renderUnsupportedView,
          renderErrorView = _this$props2.renderErrorView,
          renderLoadingView = _this$props2.renderLoadingView,
          useVideoInput = _this$props2.useVideoInput;
      var _this$state = this.state,
          isVideoInputSupported = _this$state.isVideoInputSupported,
          isReplayingVideo = _this$state.isReplayingVideo,
          isInlineRecordingSupported = _this$state.isInlineRecordingSupported,
          thereWasAnError = _this$state.thereWasAnError,
          error = _this$state.error,
          isCameraOn = _this$state.isCameraOn,
          isConnecting = _this$state.isConnecting,
          isReplayVideoMuted = _this$state.isReplayVideoMuted;
      var shouldUseVideoInput = useVideoInput || !isInlineRecordingSupported && isVideoInputSupported;
      var videoInput = shouldUseVideoInput ? /*#__PURE__*/_react["default"].createElement("input", {
        ref: this.videoInput,
        key: "videoInput",
        type: "file",
        accept: "video/*",
        capture: useVideoInput ? undefined : 'user',
        style: {
          display: 'none'
        },
        onChange: this.handleVideoSelected
      }) : null;

      if (isReplayingVideo) {
        return /*#__PURE__*/_react["default"].createElement(CameraView, {
          key: "replay"
        }, /*#__PURE__*/_react["default"].createElement(Video, {
          ref: function ref(el) {
            return _this3.replayVideo = el;
          },
          src: this.state.videoUrl,
          loop: true,
          muted: isReplayVideoMuted,
          playsInline: true,
          autoPlay: !replayVideoAutoplayAndLoopOff,
          controls: showReplayControls,
          onClick: this.handleReplayVideoClick,
          onDurationChange: this.handleDurationChange
        }), videoInput);
      }

      if (shouldUseVideoInput) {
        return renderVideoInputView({
          videoInput: videoInput
        });
      }

      if (!isInlineRecordingSupported) {
        return renderUnsupportedView();
      }

      if (thereWasAnError) {
        return renderErrorView({
          error: error
        });
      }

      if (isCameraOn) {
        return /*#__PURE__*/_react["default"].createElement(CameraView, {
          key: "camera"
        }, /*#__PURE__*/_react["default"].createElement(Video, {
          isFlipped: this.props.isFlipped,
          ref: function ref(el) {
            return _this3.cameraVideo = el;
          },
          autoPlay: true,
          muted: true
        }));
      }

      if (isConnecting) {
        return renderLoadingView();
      }

      return renderDisconnectedView();
    }
  }, {
    key: "render",
    value: function render() {
      var _this$state2 = this.state,
          isVideoInputSupported = _this$state2.isVideoInputSupported,
          isInlineRecordingSupported = _this$state2.isInlineRecordingSupported,
          thereWasAnError = _this$state2.thereWasAnError,
          isRecording = _this$state2.isRecording,
          isCameraOn = _this$state2.isCameraOn,
          streamIsReady = _this$state2.streamIsReady,
          isConnecting = _this$state2.isConnecting,
          isRunningCountdown = _this$state2.isRunningCountdown,
          isReplayingVideo = _this$state2.isReplayingVideo,
          isReplayVideoMuted = _this$state2.isReplayVideoMuted;
      var _this$props3 = this.props,
          countdownTime = _this$props3.countdownTime,
          timeLimit = _this$props3.timeLimit,
          showReplayControls = _this$props3.showReplayControls,
          replayVideoAutoplayAndLoopOff = _this$props3.replayVideoAutoplayAndLoopOff,
          renderActions = _this$props3.renderActions,
          useVideoInput = _this$props3.useVideoInput;
      return /*#__PURE__*/_react["default"].createElement(Wrapper, null, this.renderCameraView(), renderActions({
        isVideoInputSupported: isVideoInputSupported,
        isInlineRecordingSupported: isInlineRecordingSupported,
        thereWasAnError: thereWasAnError,
        isRecording: isRecording,
        isCameraOn: isCameraOn,
        streamIsReady: streamIsReady,
        isConnecting: isConnecting,
        isRunningCountdown: isRunningCountdown,
        isReplayingVideo: isReplayingVideo,
        isReplayVideoMuted: isReplayVideoMuted,
        countdownTime: countdownTime,
        timeLimit: timeLimit,
        showReplayControls: showReplayControls,
        replayVideoAutoplayAndLoopOff: replayVideoAutoplayAndLoopOff,
        useVideoInput: useVideoInput,
        onTurnOnCamera: this.turnOnCamera,
        onTurnOffCamera: this.turnOffCamera,
        onOpenVideoInput: this.handleOpenVideoInput,
        onStartRecording: this.handleStartRecording,
        onStopRecording: this.handleStopRecording,
        onPauseRecording: this.handlePauseRecording,
        onResumeRecording: this.handleResumeRecording,
        onStopReplaying: this.handleStopReplaying
      }));
    }
  }]);

  return VideoRecorder;
}(_react.Component);

exports["default"] = VideoRecorder;

_defineProperty(VideoRecorder, "propTypes", {
  /** Whether or not to start the camera initially */
  isOnInitially: _propTypes["default"].bool,

  /** Whether or not to display the video flipped (makes sense for user facing camera) */
  isFlipped: _propTypes["default"].bool,

  /** Pass this if you want to force a specific mime-type for the video */
  mimeType: _propTypes["default"].string,

  /** How much time to wait until it starts recording (in ms) */
  countdownTime: _propTypes["default"].number,

  /** Use this if you want to set a time limit for the video (in ms) */
  timeLimit: _propTypes["default"].number,

  /** Use this if you want to show play/pause/etc. controls on the replay video */
  showReplayControls: _propTypes["default"].bool,

  /** Use this to turn off autoplay and looping of the replay video. It is recommended to also showReplayControls in order to play */
  replayVideoAutoplayAndLoopOff: _propTypes["default"].bool,

  /** Use this if you want to customize the constraints passed to getUserMedia() */
  constraints: _propTypes["default"].shape({
    audio: _propTypes["default"].any,
    video: _propTypes["default"].any
  }),
  chunkSize: _propTypes["default"].number,
  dataAvailableTimeout: _propTypes["default"].number,
  useVideoInput: _propTypes["default"].bool,
  renderDisconnectedView: _propTypes["default"].func,
  renderLoadingView: _propTypes["default"].func,
  renderVideoInputView: _propTypes["default"].func,
  renderUnsupportedView: _propTypes["default"].func,
  renderErrorView: _propTypes["default"].func,
  renderActions: _propTypes["default"].func,
  onCameraOn: _propTypes["default"].func,
  onTurnOnCamera: _propTypes["default"].func,
  onTurnOffCamera: _propTypes["default"].func,
  onStartRecording: _propTypes["default"].func,
  onStopRecording: _propTypes["default"].func,
  onPauseRecording: _propTypes["default"].func,
  onResumeRecording: _propTypes["default"].func,
  onRecordingComplete: _propTypes["default"].func,
  onOpenVideoInput: _propTypes["default"].func,
  onStopReplaying: _propTypes["default"].func,
  onError: _propTypes["default"].func
});

_defineProperty(VideoRecorder, "defaultProps", {
  renderUnsupportedView: function renderUnsupportedView() {
    return /*#__PURE__*/_react["default"].createElement(_unsupportedView["default"], null);
  },
  renderErrorView: function renderErrorView() {
    return /*#__PURE__*/_react["default"].createElement(_errorView["default"], null);
  },
  renderVideoInputView: function renderVideoInputView(_ref2) {
    var videoInput = _ref2.videoInput;
    return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, videoInput);
  },
  renderDisconnectedView: function renderDisconnectedView() {
    return /*#__PURE__*/_react["default"].createElement(_disconnectedView["default"], null);
  },
  renderLoadingView: function renderLoadingView() {
    return /*#__PURE__*/_react["default"].createElement(_loadingView["default"], null);
  },
  renderActions: _renderActions["default"],
  isFlipped: true,
  countdownTime: 3000,
  constraints: CONSTRAINTS,
  chunkSize: 250,
  dataAvailableTimeout: 500
});