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
      return shouldUseVideoInput ? (
        <Button onClick={onOpenVideoInput}>Record another video</Button>
      ) : (
        <RecordButton onClick={onTurnOnCamera} />
      )
    }

    if (isRecording) {
      return <StopButton onClick={onStopRecording} />
    }

    if (isCameraOn && streamIsReady) {
      return <RecordButton onClick={onStartRecording} />
    }

    return shouldUseVideoInput ? (
      <Button onClick={onOpenVideoInput}>Record a video</Button>
    ) : (
      <Button onClick={onTurnOnCamera}>Turn my camera ON</Button>
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
