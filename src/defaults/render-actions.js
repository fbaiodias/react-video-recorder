import React from 'react'
import styled from 'styled-components'
import Button from './button'

const ActionsWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 30px;
`

export default ({
  isVideoInputSupported,
  isInlineRecordingSupported,
  thereWasAnError,
  isRecording,
  isCameraOn,
  streamIsReady,
  isConnecting,

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

    if (!isInlineRecordingSupported || thereWasAnError || isConnecting) {
      return null
    }

    if (isRecording) {
      return <Button onClick={onStopRecording}>Stop recording</Button>
    }

    if (isCameraOn && streamIsReady) {
      return (
        <div>
          <Button onClick={onTurnOffCamera}>Turn camera off</Button>
          <Button onClick={onStartRecording}>Start recording</Button>
        </div>
      )
    }

    return <Button onClick={onTurnOnCamera}>Turn camera on</Button>
  }

  return <ActionsWrapper>{renderContent()}</ActionsWrapper>
}
