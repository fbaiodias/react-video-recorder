"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _button = _interopRequireDefault(require("./button"));

var _ActionButtons = require("./ActionButtons");

var _timer = _interopRequireDefault(require("./timer"));

var _countdown = _interopRequireDefault(require("./countdown"));

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

var ActionsWrapper = _styledComponents["default"].div.withConfig({
  displayName: "render-actions__ActionsWrapper",
  componentId: "dp6lnv-0"
})(["position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;padding-top:20px;padding-bottom:80px;"]);

var onTick = function onTick(state) {
  console.log('onTick: ');
  console.table(state);
};

var Actions = /*#__PURE__*/function (_PureComponent) {
  _inherits(Actions, _PureComponent);

  var _super = _createSuper(Actions);

  function Actions() {
    _classCallCheck(this, Actions);

    return _super.apply(this, arguments);
  }

  _createClass(Actions, [{
    key: "renderContent",
    value: function renderContent() {
      var _this$props = this.props,
          isVideoInputSupported = _this$props.isVideoInputSupported,
          isInlineRecordingSupported = _this$props.isInlineRecordingSupported,
          thereWasAnError = _this$props.thereWasAnError,
          isRecording = _this$props.isRecording,
          isCameraOn = _this$props.isCameraOn,
          streamIsReady = _this$props.streamIsReady,
          isConnecting = _this$props.isConnecting,
          isRunningCountdown = _this$props.isRunningCountdown,
          isReplayingVideo = _this$props.isReplayingVideo,
          countdownTime = _this$props.countdownTime,
          timeLimit = _this$props.timeLimit,
          useVideoInput = _this$props.useVideoInput,
          onTurnOnCamera = _this$props.onTurnOnCamera,
          onOpenVideoInput = _this$props.onOpenVideoInput,
          onStartRecording = _this$props.onStartRecording,
          onStopRecording = _this$props.onStopRecording,
          onStopReplaying = _this$props.onStopReplaying,
          onConfirm = _this$props.onConfirm,
          PrimaryButtonComponent = _this$props.PrimaryButtonComponent;
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

      console.group('renderActions');
      console.log('---------------- isRecording: ', isRecording);
      console.log('---------------- timeLimit ', timeLimit);
      console.log('---------------- countdownTime ', countdownTime);
      console.groupEnd();

      if (isRecording) {
        return /*#__PURE__*/_react["default"].createElement(PrimaryButtonComponent, {
          onClick: onStopRecording,
          maxSeconds: timeLimit,
          status: isRecording ? 'recording' : '',
          "data-qa": "stop-recording"
        });
      }

      if (isCameraOn && streamIsReady) {
        return /*#__PURE__*/_react["default"].createElement(PrimaryButtonComponent, {
          status: isRecording ? 'recording' : '',
          maxSeconds: timeLimit,
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
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          isRecording = _this$props2.isRecording,
          isRunningCountdown = _this$props2.isRunningCountdown,
          countdownTime = _this$props2.countdownTime,
          timeLimit = _this$props2.timeLimit;
      return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, isRecording && /*#__PURE__*/_react["default"].createElement(_timer["default"], {
        onTick: onTick,
        timeLimit: timeLimit
      }), isRunningCountdown && /*#__PURE__*/_react["default"].createElement(_countdown["default"], {
        countdownTime: countdownTime
      }), /*#__PURE__*/_react["default"].createElement(ActionsWrapper, null, this.renderContent()));
    }
  }]);

  return Actions;
}(_react.PureComponent);

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
  onConfirm: _propTypes["default"].func,
  PrimaryButtonComponent: _propTypes["default"].elementType
};
var _default = Actions;
exports["default"] = _default;