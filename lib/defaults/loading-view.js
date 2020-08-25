"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var LoadingMessage = _styledComponents["default"].div.withConfig({
  displayName: "loading-view__LoadingMessage",
  componentId: "uxy82i-0"
})(["font-family:Arial;"]);

var LoadingView = function LoadingView() {
  return /*#__PURE__*/_react["default"].createElement(LoadingMessage, null, "Loading...");
};

var _default = LoadingView;
exports["default"] = _default;