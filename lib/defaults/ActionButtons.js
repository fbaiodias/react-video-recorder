"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RetakeButton = exports.SaveButton = void 0;

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Button = _styledComponents["default"].div.withConfig({
  displayName: "ActionButtons__Button",
  componentId: "sc-1j6vdv8-0"
})(["display:flex;flex-direction:row;justify-items:center;align-items:center;font-size:18px;border-radius:28px;background:#f0f0f0;color:#303030;border:2px solid transparent;cursor:pointer;font-family:\"HelveticaNeue-Medium\",\"Helvetica Neue Medium\",\"Helvetica Neue\",Helvetica,Arial,\"Lucida Grande\",sans-serif;font-weight:normal;transition:all 0.2s ease-out;"]);

var Retake = _styledComponents["default"].div.withConfig({
  displayName: "ActionButtons__Retake",
  componentId: "sc-1j6vdv8-1"
})(["display:flex;flex-direction:row;justify-items:center;align-items:center;font-size:18px;border-radius:5px;background:#f0f0f0;color:#303030;border:2px solid transparent;cursor:pointer;font-family:\"HelveticaNeue-Medium\",\"Helvetica Neue Medium\",\"Helvetica Neue\",Helvetica,Arial,\"Lucida Grande\",sans-serif;font-weight:normal;transition:all 0.2s ease-out;border-color:rgba(204,204,204,0.5);background:rgba(255,255,255,0.1);color:#ffffff;padding:3px 15px;position:relative;top:115px;left:-20%;:hover{color:#ffffff;background:rgba(255,255,255,0.2);}"]);

var Save = _styledComponents["default"].div.withConfig({
  displayName: "ActionButtons__Save",
  componentId: "sc-1j6vdv8-2"
})(["display:flex;flex-direction:row;justify-items:center;align-items:center;font-size:18px;border-radius:5px;background:#f0f0f0;color:#303030;border:2px solid transparent;cursor:pointer;font-family:\"HelveticaNeue-Medium\",\"Helvetica Neue Medium\",\"Helvetica Neue\",Helvetica,Arial,\"Lucida Grande\",sans-serif;font-weight:normal;transition:all 0.2s ease-out;z-index:2;color:#fff;box-shadow:0px 0px 0px 2px white inset;background:#3fa842;position:relative;top:115px;right:-20%;padding:3px 15px;"]);

var classes = {
  button: {
    name: "rec-button",
    modifiers: ["kind"],
    states: []
  }
};

var SaveButton = function SaveButton(_ref) {
  var onClick = _ref.onClick;
  return /*#__PURE__*/_react["default"].createElement(Save, {
    onClick: onClick,
    className: "flex flex-row flex-center flex-align-center font-size-18 bold-font"
  }, "Save video");
};

exports.SaveButton = SaveButton;

var RetakeButton = function RetakeButton(_ref2) {
  var onClick = _ref2.onClick;
  return /*#__PURE__*/_react["default"].createElement(Retake, {
    onClick: onClick,
    className: "flex flex-row flex-center flex-align-center font-size-18 bold-font"
  }, /*#__PURE__*/_react["default"].createElement("i", {
    className: "icon-refresh mr-10"
  }), "Retake video");
}; // Leaving this code for now because not sure if we will need it yet or not
// export const UploadButton = ({ onClick }) => (
//   <div
//     role="button"
//     className={bem(
//       classes.button,
//       { kind: "upload" },
//       "flex flex-row flex-center flex-align-center font-size-18 bold-font"
//     )}
//     onClick={onClick}
//   >
//     <i className="icon-upload-alt"></i>
//     <span className={`${classes.button.name}__label ml-10`}>Upload video</span>
//   </div>
// );
// export const HelpButton = ({ onClick }) => (
//   <div
//     role="button"
//     className={bem(
//       classes.button,
//       { kind: "help" },
//       "flex flex-row flex-center flex-align-center font-size-18 bold-font"
//     )}
//     onClick={onClick}
//   >
//     <i className="icon-question"></i>
//     <span className={`${classes.button.name}__label ml-10`}>Get help</span>
//   </div>
// );


exports.RetakeButton = RetakeButton;