import React from 'react'
import styled from 'styled-components'
import Button from './button'
import ButtonRec from './buttonRec'
import ButtonStop from './buttonStop'
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
  padding-bottom: 15vh;
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

  onTurnOnCamera,
  onTurnOffCamera,
  onOpenVideoInput,
  onStartRecording,
  onStopRecording
}) => {
  const renderContent = () => {
    if (!isInlineRecordingSupported && isVideoInputSupported) {
      return <Button onClick={onOpenVideoInput}>Record a video</Button>
    }

    if (
      !isInlineRecordingSupported ||
      thereWasAnError ||
      isConnecting ||
      isRunningCountdown
    ) {
      return null
    }

    if (isRecording) {
      return <ButtonStop onClick={onStopRecording} />
    }

    if (isCameraOn && streamIsReady) {
      return (
        <div>
          {/* <Button onClick={onTurnOffCamera} >.</Button> */}
          <ButtonRec onClick={onStartRecording} />
        </div>
      )
    }

    return <Button onClick={onTurnOnCamera}>Turn my camera ON</Button>
  }

  return (
    <div>
      {isRecording && <Timer />}
      {isRunningCountdown && <Countdown countdownTime={countdownTime} />}
      <ActionsWrapper>{renderContent()}</ActionsWrapper>
    </div>
  )
}
