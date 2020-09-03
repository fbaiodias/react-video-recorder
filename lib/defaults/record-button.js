"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Button = _styledComponents["default"].button.withConfig({
  displayName: "record-button__Button",
  componentId: "sc-1n5amwk-0"
})(["background:", ";color:", ";border-radius:50%;width:64px;height:64px;background:rgba(227,73,28,0.8);outline:none;border:none;cursor:pointer;:hover{background:#fb6d42;}"], function (props) {
  return props.backgroundColor;
}, function (props) {
  return props.color;
});

var RecWrapper = _styledComponents["default"].div.withConfig({
  displayName: "record-button__RecWrapper",
  componentId: "sc-1n5amwk-1"
})(["display:flex;flex-direction:column;align-items:center;"]);

var ButtonBorder = _styledComponents["default"].div.withConfig({
  displayName: "record-button__ButtonBorder",
  componentId: "sc-1n5amwk-2"
})(["border:8px solid rgba(255,255,255,0.4);height:80px;width:80px;border-radius:50%;"]);

var Instructions = _styledComponents["default"].div.withConfig({
  displayName: "record-button__Instructions",
  componentId: "sc-1n5amwk-3"
})(["font-family:Arial;font-size:14px;color:#ffffff;letter-spacing:1.75px;display:flex;margin-bottom:20px;"]);

var InstuctionsHighlight = _styledComponents["default"].div.withConfig({
  displayName: "record-button__InstuctionsHighlight",
  componentId: "sc-1n5amwk-4"
})(["font-weight:700;color:#dc6547;padding:0 5px;"]);

Button.defaultProps = {
  color: 'black',
  backgroundColor: 'white'
};

var _default = function _default(props) {
  return _react["default"].createElement(RecWrapper, null, _react["default"].createElement(Instructions, null, _react["default"].createElement("div", null, "PRESS "), _react["default"].createElement(InstuctionsHighlight, null, " REC "), "WHEN READY"), _react["default"].createElement(ButtonBorder, null, _react["default"].createElement(Button, props)));
};

exports["default"] = _default;