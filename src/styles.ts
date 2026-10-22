import { useInsertionEffect } from 'react'

// The default look. Components inject it on first render, so it works without
// importing a stylesheet; it's also published as react-video-recorder/styles.css
// for apps whose Content-Security-Policy blocks inline styles. Selectors are
// single classes, so app styles with the same specificity win.
export const STYLES = `
.rvr-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  min-height: 300px;
  background-color: #000;
  color: white;
  box-sizing: border-box;
}
.rvr-wrapper * {
  box-sizing: inherit;
}

.rvr-camera-view {
  width: 100%;
  height: 100%;
}

.rvr-video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-height: 100%;
  min-width: 100%;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rvr-video--flipped {
  transform: translate(-50%, -50%) scaleX(-1);
}
.rvr-video--clickable {
  cursor: pointer;
}

.rvr-actions {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rvr-button {
  background: var(--rvr-button-background, white);
  color: var(--rvr-button-color, black);
  border-radius: 4px;
  height: 40px;
  padding: 0px 18px;
  border: none;
  margin: -8px;
  font-size: 14px;
  font-weight: bold;
  outline: none;
  cursor: pointer;
}
.rvr-button:hover {
  background: #eee;
}

.rvr-record-button {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.rvr-record-button__instructions {
  font-family: Arial;
  font-size: 14px;
  color: #ffffff;
  letter-spacing: 1.75px;
  display: flex;
  margin-bottom: 20px;
}
.rvr-record-button__highlight {
  font-weight: 700;
  color: #dc6547;
  padding: 0 5px;
}
.rvr-record-button__border {
  border: 8px solid rgba(255, 255, 255, 0.4);
  height: 80px;
  width: 80px;
  border-radius: 50%;
}
.rvr-record-button__button {
  color: black;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  background: rgba(227, 73, 28, 0.8);
  outline: none;
  border: none;
  cursor: pointer;
  z-index: 5;
}
.rvr-record-button__button:hover {
  background: #fb6d42;
}

.rvr-stop-button {
  background: rgba(255, 255, 255, 0.4);
  height: 80px;
  width: 80px;
  border-radius: 50%;
}
.rvr-stop-button__button {
  color: black;
  border-radius: 4px;
  width: 40px;
  height: 40px;
  background: rgba(227, 73, 28, 0.8);
  outline: none;
  border: none;
  cursor: pointer;
  margin: 20px;
}
.rvr-stop-button__button:hover {
  background: #fb6d42;
}

.rvr-timer {
  position: absolute;
  top: 50px;
  right: 50px;
  font-family: Menlo, monospace;
  font-size: 28px;
  text-shadow: 1px 2px rgba(0, 0, 0, 0.5);
}
.rvr-timer__icon {
  width: 16px;
  height: 16px;
  background: #e55226;
  border-radius: 50%;
  float: left;
  margin: 2px 8px;
  margin-left: 0;
}

.rvr-countdown {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Menlo, monospace;
  font-size: 100px;
  text-shadow: 1px 2px rgba(0, 0, 0, 0.5);
}

.rvr-loading {
  font-family: Arial;
}

.rvr-disconnected {
  max-height: 100%;
  max-width: 100%;
  margin-bottom: 140px;
}

.rvr-switch-camera {
  width: 80px;
  height: 80px;
  bottom: 4px;
  right: 4px;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  padding-left: 8px;
  padding-top: 10px;
  position: absolute;
  cursor: pointer;
}
`

const STYLE_ELEMENT_ID = 'react-video-recorder-styles'

/** Adds the default styles to the document, once. */
export function injectStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ELEMENT_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ELEMENT_ID
  style.textContent = STYLES
  // First in <head>, so the app's own stylesheets come later and win ties.
  document.head.prepend(style)
}

export function useStyles() {
  useInsertionEffect(injectStyles, [])
}

export const cx = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ')
