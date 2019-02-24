import React from 'react'
import styled from 'styled-components'
import Button from './button'
import RecordButton from './record-button'
import StopButton from './stop-button'
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

export default ({
  isVideoInputSupported,
  isInlineRecordingSupported,
  thereWasAnError,
  isRecording,
  isCameraOn,
  streamIsReady,
  isConnecting,
  isRunningCountdown,
  countdownTime,
  timeLimit,
  isReplayingVideo,

  onTurnOnCamera,
  onTurnOffCamera,
  onOpenVideoInput,
  onStartRecording,
  onStopRecording,
  onStopReplaying,
  onConfirm
}) => {
  const renderContent = () => {
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
        <Button onClick={onStopReplaying} data-qa='start-replaying'>
          Record another video
        </Button>
      )
    }

    if (isRecording) {
      return <StopButton onClick={onStopRecording} data-qa='stop-recording' />
    }

    if (isCameraOn && streamIsReady) {
      return (
        <RecordButton onClick={onStartRecording} data-qa='start-recording' />
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

  return (
    <div>
      {isRecording && <Timer timeLimit={timeLimit} />}
      {isRunningCountdown && <Countdown countdownTime={countdownTime} />}
      <ActionsWrapper>{renderContent()}</ActionsWrapper>
    </div>
  )
}
