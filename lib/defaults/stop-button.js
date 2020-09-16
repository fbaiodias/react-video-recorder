"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Button = _styledComponents["default"].button.withConfig({
  displayName: "stop-button__Button",
  componentId: "sc-1h536gx-0"
})(["background:pink;color:", ";border-radius:4px;width:50px;height:50px;background:rgba(227,73,28,0.8);outline:none;border:none;cursor:pointer;margin:25px !important;:hover{background:#fb6d42;}"], function (props) {
  return props.color;
});

var Border = _styledComponents["default"].div.withConfig({
  displayName: "stop-button__Border",
  componentId: "sc-1h536gx-1"
})(["background:rgba(255,255,255,0.4);height:100px;width:100px;border-radius:50%;position:absolute;bottom:-50px;"]);

Button.defaultProps = {
  color: 'black',
  backgroundColor: 'white'
};

var _default = function _default(props) {
  return /*#__PURE__*/_react["default"].createElement(Border, null, /*#__PURE__*/_react["default"].createElement(Button, props));
};

exports["default"] = _default;