import React, { PureComponent, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Button from './button'
import { RetakeButton, SaveButton } from './ActionButtons'
import Timer from './timer'
import Countdown from './countdown'

const ActionsWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 80px;
`

const onTick = state => {
  console.log('onTick: ')
  console.table(state)
}

class Actions extends PureComponent {
  renderContent () {
    const {
      isVideoInputSupported,
      isInlineRecordingSupported,
      thereWasAnError,
      isRecording,
      isCameraOn,
      streamIsReady,
      isConnecting,
      isRunningCountdown,
      isReplayingVideo,
      countdownTime,
      timeLimit,
      useVideoInput,

      onTurnOnCamera,
      onOpenVideoInput,
      onStartRecording,
      onStopRecording,
      onStopReplaying,
      onConfirm,
      PrimaryButtonComponent
    } = this.props

    const shouldUseVideoInput =
      !isInlineRecordingSupported && isVideoInputSupported

    if (
      (!isInlineRecordingSupported && !isVideoInputSupported) ||
      thereWasAnError ||
      isConnecting ||
      isRunningCountdown
    ) {
      return null
    }

    if (isReplayingVideo) {
      return (
        <>
          <RetakeButton onClick={onStopReplaying} data-qa='start-replaying' />
          {/* TODO: figure out how to trigger the "done" */}
          <SaveButton onClick={onConfirm} />
        </>
      )
    }

    console.group('renderActions')
    console.log('---------------- isRecording: ', isRecording)
    console.log('---------------- timeLimit ', timeLimit)
    console.log('---------------- countdownTime ', countdownTime)
    console.groupEnd()

    if (isRecording) {
      return (
        <PrimaryButtonComponent
          onClick={onStopRecording}
          maxSeconds={timeLimit}
          status={isRecording ? 'recording' : ''}
          data-qa='stop-recording'
        />
      )
    }

    if (isCameraOn && streamIsReady) {
      return (
        <PrimaryButtonComponent
          status={isRecording ? 'recording' : ''}
          maxSeconds={timeLimit}
          onClick={onStartRecording}
          data-qa='start-recording'
        />
      )
    }

    if (useVideoInput) {
      return (
        <Button onClick={onOpenVideoInput} data-qa='open-input'>
          Upload a video
        </Button>
      )
    }

    return shouldUseVideoInput ? (
      <Button onClick={onOpenVideoInput} data-qa='open-input'>
        Record a video
      </Button>
    ) : (
      <Button onClick={onTurnOnCamera} data-qa='turn-on-camera'>
        Turn my camera ON
      </Button>
    )
  }

  render () {
    const {
      isRecording,
      isRunningCountdown,
      countdownTime,
      timeLimit
    } = this.props

    return (
      <>
        {isRecording && <Timer onTick={onTick} timeLimit={timeLimit} />}
        {isRunningCountdown && <Countdown countdownTime={countdownTime} />}
        <ActionsWrapper>{this.renderContent()}</ActionsWrapper>
      </>
    )
  }
}

Actions.propTypes = {
  isVideoInputSupported: PropTypes.bool,
  isInlineRecordingSupported: PropTypes.bool,
  thereWasAnError: PropTypes.bool,
  isRecording: PropTypes.bool,
  isCameraOn: PropTypes.bool,
  streamIsReady: PropTypes.bool,
  isConnecting: PropTypes.bool,
  isRunningCountdown: PropTypes.bool,
  countdownTime: PropTypes.number,
  timeLimit: PropTypes.number,
  showReplayControls: PropTypes.bool,
  replayVideoAutoplayAndLoopOff: PropTypes.bool,
  isReplayingVideo: PropTypes.bool,
  useVideoInput: PropTypes.bool,

  onTurnOnCamera: PropTypes.func,
  onTurnOffCamera: PropTypes.func,
  onOpenVideoInput: PropTypes.func,
  onStartRecording: PropTypes.func,
  onStopRecording: PropTypes.func,
  onPauseRecording: PropTypes.func,
  onResumeRecording: PropTypes.func,
  onStopReplaying: PropTypes.func,
  onConfirm: PropTypes.func,

  PrimaryButtonComponent: PropTypes.elementType
}

export default Actions
