import React from "react";
import styled from "styled-components";

const Button = styled.div`
  display: flex;
  flex-direction: row;
  justify-items: center;
  align-items: center;
  font-size: 18px;
  border-radius: 28px;
  background: #f0f0f0;
  color: #303030;
  border: 2px solid transparent;
  cursor: pointer;
  font-family: "HelveticaNeue-Medium", "Helvetica Neue Medium", "Helvetica Neue",
    Helvetica, Arial, "Lucida Grande", sans-serif;
  font-weight: normal;
  transition: all 0.2s ease-out;
`;
const Retake = styled.div`
  display: flex;
  flex-direction: row;
  justify-items: center;
  align-items: center;
  font-size: 18px;
  border-radius: 5px;
  background: #f0f0f0;
  color: #303030;
  border: 2px solid transparent;
  cursor: pointer;
  font-family: "HelveticaNeue-Medium", "Helvetica Neue Medium", "Helvetica Neue",
    Helvetica, Arial, "Lucida Grande", sans-serif;
  font-weight: normal;
  transition: all 0.2s ease-out;
  border-color: rgba(204, 204, 204, 0.5) ;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 3px 15px;
  position: relative;
  top: 115px;
  left: -20%;
  :hover{
    color: #ffffff;
    background: rgba(255, 255, 255, 0.2);
  }
`;
const Save = styled.div`
  display: flex;
  flex-direction: row;
  justify-items: center;
  align-items: center;
  font-size: 18px;
  border-radius: 5px;
  background: #f0f0f0;
  color: #303030;
  border: 2px solid transparent;
  cursor: pointer;
  font-family: "HelveticaNeue-Medium", "Helvetica Neue Medium", "Helvetica Neue",
    Helvetica, Arial, "Lucida Grande", sans-serif;
  font-weight: normal;
  transition: all 0.2s ease-out;
  z-index: 2;
  color: #fff;
  box-shadow: 0px 0px 0px 2px white inset;
  background: #3fa842;
  position: relative;
  top: 115px;
  right: -20%;
  padding: 3px 15px;
`;

const classes = {
  button: {
    name: "rec-button",
    modifiers: ["kind"],
    states: [],
  },
};

export const SaveButton = ({ onClick }) => (
    <Save onClick={onClick} className="flex flex-row flex-center flex-align-center font-size-18 bold-font" >
        Save video</Save>
);

export const RetakeButton = ({ onClick }) => (
  <Retake
    onClick={onClick}
    className="flex flex-row flex-center flex-align-center font-size-18 bold-font"
  >
    <i className="icon-refresh mr-10" />
    Retake video
  </Retake>
);

// Leaving this code for now because not sure if we will need it yet or not
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
