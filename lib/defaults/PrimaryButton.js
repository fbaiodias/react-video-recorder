"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _icn_camera = _interopRequireDefault(require("../assets/icn_camera.svg"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var PrimaryButton = function PrimaryButton(_ref) {
  var onClick = _ref.onClick;
  var r = 85;
  var circumference = 2 * Math.PI * r;
  var offset = 0;
  return _react["default"].createElement("div", {
    role: "button",
    onClick: onClick,
    style: {
      position: 'absolute',
      width: '100px',
      top: '45px',
      transform: 'translate(-50 %, -20 %) scale(1)'
    }
  }, _react["default"].createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 200 200"
  }, _react["default"].createElement("circle", {
    cx: "100",
    cy: "100",
    r: "100",
    fill: "#000000",
    opacity: "1.0"
  }), _react["default"].createElement("circle", {
    style: {
      strokeDasharray: 534.07075,
      transition: 'all 1s',
      opacity: 0.2
    },
    cx: "100",
    cy: "100",
    r: r,
    stroke: "#ffffff",
    strokeWidth: "8",
    strokeLinecap: "round",
    fill: "none",
    opacity: "0.3"
  }), _react["default"].createElement("circle", {
    style: {
      opacity: 0
    },
    cx: "100",
    cy: "100",
    r: r,
    stroke: "#ffffff",
    strokeWidth: "8",
    strokeDashoffset: offset,
    strokeLinecap: "round",
    fill: "none"
  }), _react["default"].createElement("circle", {
    style: {
      transition: 'all 0.3s',
      opacity: 0.4,
      fill: '#ffffff',
      transform: 'scale(1)',
      transformOrigin: 'center'
    },
    cx: "100",
    cy: "100",
    r: "70",
    fill: "#ffffff"
  }), _react["default"].createElement("rect", {
    style: {
      opacity: 0
    },
    x: 65,
    y: 65,
    width: 70,
    height: 70,
    rx: "10",
    fill: "#ffffff"
  }), _react["default"].createElement(_icn_camera["default"], {
    width: 80,
    height: 80,
    x: 60,
    y: 60,
    fill: "#ffffff"
  })));
};

var _default = PrimaryButton;
exports["default"] = _default;