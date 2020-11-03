"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Button = _styledComponents["default"].button.attrs(function (props) {
  return {
    type: props.type || 'button'
  };
}).withConfig({
  displayName: "stop-button__Button",
  componentId: "sc-1h536gx-0"
})(["background:", ";color:", ";border-radius:4px;width:40px;height:40px;background:rgba(227,73,28,0.8);outline:none;border:none;cursor:pointer;margin:20px;:hover{background:#fb6d42;}"], function (props) {
  return props.backgroundColor;
}, function (props) {
  return props.color;
});

var Border = _styledComponents["default"].div.withConfig({
  displayName: "stop-button__Border",
  componentId: "sc-1h536gx-1"
})(["background:rgba(255,255,255,0.4);height:80px;width:80px;border-radius:50%;"]);

Button.defaultProps = {
  color: 'black',
  backgroundColor: 'white'
};

var _default = function _default(props) {
  return /*#__PURE__*/_react["default"].createElement(Border, null, /*#__PURE__*/_react["default"].createElement(Button, props));
};

exports["default"] = _default;