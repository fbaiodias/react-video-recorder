"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _button = _interopRequireDefault(require("./button"));

var _ActionButtons = require("./ActionButtons");

var _PrimaryButton = _interopRequireDefault(require("./PrimaryButton"));

var _stopButton = _interopRequireDefault(require("./stop-button"));

var _timer = _interopRequireDefault(require("./timer"));

var _countdown = _interopRequireDefault(require("./countdown"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var ActionsWrapper = _styledComponents["default"].div.withConfig({
  displayName: "render-actions__ActionsWrapper",
  componentId: "dp6lnv-0"
})(["position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;padding-top:20px;padding-bottom:80px;"]);

var Actions = function Actions(_ref) {
  var isVideoInputSupported = _ref.isVideoInputSupported,
      isInlineRecordingSupported = _ref.isInlineRecordingSupported,
      thereWasAnError = _ref.thereWasAnError,
      isRecording = _ref.isRecording,
      isCameraOn = _ref.isCameraOn,
      streamIsReady = _ref.streamIsReady,
      isConnecting = _ref.isConnecting,
      isRunningCountdown = _ref.isRunningCountdown,
      isReplayingVideo = _ref.isReplayingVideo,
      countdownTime = _ref.countdownTime,
      timeLimit = _ref.timeLimit,
      showReplayControls = _ref.showReplayControls,
      replayVideoAutoplayAndLoopOff = _ref.replayVideoAutoplayAndLoopOff,
      useVideoInput = _ref.useVideoInput,
      onTurnOnCamera = _ref.onTurnOnCamera,
      onTurnOffCamera = _ref.onTurnOffCamera,
      onOpenVideoInput = _ref.onOpenVideoInput,
      onStartRecording = _ref.onStartRecording,
      onStopRecording = _ref.onStopRecording,
      onPauseRecording = _ref.onPauseRecording,
      onResumeRecording = _ref.onResumeRecording,
      onStopReplaying = _ref.onStopReplaying,
      onConfirm = _ref.onConfirm;

  var renderContent = function renderContent() {
    var shouldUseVideoInput = !isInlineRecordingSupported && isVideoInputSupported;

    if (!isInlineRecordingSupported && !isVideoInputSupported || thereWasAnError || isConnecting || isRunningCountdown) {
      return null;
    }

    if (isReplayingVideo) {
      return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_ActionButtons.RetakeButton, {
        onClick: onStopReplaying,
        "data-qa": "start-replaying"
      }), /*#__PURE__*/_react["default"].createElement(_ActionButtons.SaveButton, {
        onClick: onConfirm
      }));
    }

    if (isRecording) {
      return /*#__PURE__*/_react["default"].createElement(_stopButton["default"], {
        onClick: onStopRecording,
        "data-qa": "stop-recording"
      });
    }

    if (isCameraOn && streamIsReady) {
      return /*#__PURE__*/_react["default"].createElement(_PrimaryButton["default"], {
        onClick: onStartRecording,
        "data-qa": "start-recording"
      });
    }

    if (useVideoInput) {
      return /*#__PURE__*/_react["default"].createElement(_button["default"], {
        onClick: onOpenVideoInput,
        "data-qa": "open-input"
      }, "Upload a video");
    }

    return shouldUseVideoInput ? /*#__PURE__*/_react["default"].createElement(_button["default"], {
      onClick: onOpenVideoInput,
      "data-qa": "open-input"
    }, "Record a video") : /*#__PURE__*/_react["default"].createElement(_button["default"], {
      onClick: onTurnOnCamera,
      "data-qa": "turn-on-camera"
    }, "Turn my camera ON");
  };

  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, isRecording && /*#__PURE__*/_react["default"].createElement(_timer["default"], {
    timeLimit: timeLimit
  }), isRunningCountdown && /*#__PURE__*/_react["default"].createElement(_countdown["default"], {
    countdownTime: countdownTime
  }), /*#__PURE__*/_react["default"].createElement(ActionsWrapper, null, renderContent()));
};

Actions.propTypes = {
  isVideoInputSupported: _propTypes["default"].bool,
  isInlineRecordingSupported: _propTypes["default"].bool,
  thereWasAnError: _propTypes["default"].bool,
  isRecording: _propTypes["default"].bool,
  isCameraOn: _propTypes["default"].bool,
  streamIsReady: _propTypes["default"].bool,
  isConnecting: _propTypes["default"].bool,
  isRunningCountdown: _propTypes["default"].bool,
  countdownTime: _propTypes["default"].number,
  timeLimit: _propTypes["default"].number,
  showReplayControls: _propTypes["default"].bool,
  replayVideoAutoplayAndLoopOff: _propTypes["default"].bool,
  isReplayingVideo: _propTypes["default"].bool,
  useVideoInput: _propTypes["default"].bool,
  onTurnOnCamera: _propTypes["default"].func,
  onTurnOffCamera: _propTypes["default"].func,
  onOpenVideoInput: _propTypes["default"].func,
  onStartRecording: _propTypes["default"].func,
  onStopRecording: _propTypes["default"].func,
  onPauseRecording: _propTypes["default"].func,
  onResumeRecording: _propTypes["default"].func,
  onStopReplaying: _propTypes["default"].func,
  onConfirm: _propTypes["default"].func
};
var _default = Actions;
exports["default"] = _default;