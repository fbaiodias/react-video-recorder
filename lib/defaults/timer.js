"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

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

var Text = _styledComponents["default"].div.withConfig({
  displayName: "timer__Text",
  componentId: "avqbub-0"
})(["position:absolute;top:50px;right:50px;font-family:Menlo,monospace;font-size:28px;text-shadow:1px 2px rgba(0,0,0,0.5);"]);

var RecIcon = _styledComponents["default"].div.withConfig({
  displayName: "timer__RecIcon",
  componentId: "avqbub-1"
})(["width:16px;height:16px;background:#e55226;border-radius:50%;float:left;margin:2px 8px;margin-left:0;"]);

var Timer = /*#__PURE__*/function (_Component) {
  _inherits(Timer, _Component);

  var _super = _createSuper(Timer);

  function Timer(props) {
    var _this;

    _classCallCheck(this, Timer);

    _this = _super.call(this, props);
    var nextSeconds = props.timeLimit ? props.timeLimit / 1000 : 0;
    _this.state = _this.getState(nextSeconds);
    return _this;
  }

  _createClass(Timer, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      clearInterval(this.timer);
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var timeLimit = this.props.timeLimit;
      this.timer = setInterval(function () {
        var seconds = _this2.state.seconds;
        var nextSeconds = timeLimit ? seconds - 1 : seconds + 1;

        var nextState = _this2.getState(nextSeconds);

        _this2.setState(nextState);
      }, 1000);
    }
  }, {
    key: "pad",
    value: function pad(unit) {
      var str = '' + unit;
      var pad = '00';
      return pad.substring(0, pad.length - str.length) + str;
    }
  }, {
    key: "getState",
    value: function getState(seconds) {
      var minutes = Math.floor(seconds / 60);
      var humanTime = minutes !== 0 ? "".concat(minutes, ":").concat(this.pad(seconds - minutes * 60)) : "".concat(seconds - minutes * 60, "s");
      return {
        seconds: seconds,
        human: humanTime
      };
    }
  }, {
    key: "render",
    value: function render() {
      var defaultText = this.props.defaultText || '0:00';
      return /*#__PURE__*/_react["default"].createElement(Text, this.props, /*#__PURE__*/_react["default"].createElement(RecIcon, null), this.state.human || defaultText);
    }
  }]);

  return Timer;
}(_react.Component);

_defineProperty(Timer, "propTypes", {
  timeLimit: _propTypes["default"].number,
  defaultText: _propTypes["default"].string
});

var _default = Timer;
exports["default"] = _default;