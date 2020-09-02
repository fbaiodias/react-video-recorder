"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var ErrorView = function ErrorView() {
  return _react["default"].createElement("div", null, "Oh snap! Your browser failed to record your video.", _react["default"].createElement("br", null), _react["default"].createElement("br", null), "Please restart it and try again \uD83D\uDC4D");
};

var _default = ErrorView;
exports["default"] = _default;