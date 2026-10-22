import React from 'react'
import type { ReactNode } from 'react'
import PropTypes from 'prop-types'
import Button from './button'
import RecordButton from './record-button'
import StopButton from './stop-button'
import Timer from './timer'
import Countdown from './countdown'

/** Localizes the default UI's texts, e.g. `t('Turn my camera ON')` */
export type Translate = (text: string) => ReactNode

/** What VideoRecorder passes to `renderActions` */
export interface RenderActionsProps {
  t: Translate
  /** null until the component has mounted */
  isVideoInputSupported: boolean | null
  /** null until the component has mounted */
  isInlineRecordingSupported: boolean | null
  thereWasAnError: boolean
  isRecording: boolean
  isCameraOn: boolean
  streamIsReady: boolean
  isConnecting: boolean
  /** undefined until the first recording starts */
  isRunningCountdown: boolean | undefined
  isReplayingVideo: boolean
  isReplayVideoMuted: boolean
  countdownTime: number
  timeLimit: number | undefined
  showReplayControls: boolean | undefined
  replayVideoAutoplayAndLoopOff: boolean | undefined
  useVideoInput: boolean | undefined

  onTurnOnCamera: () => void
  onSwitchCamera: () => void
  onTurnOffCamera: () => void
  onOpenVideoInput: () => void
  onStartRecording: () => void
  onStopRecording: () => void
  onPauseRecording: () => void
  onResumeRecording: () => void
  onStopReplaying: () => void
}

const Actions = ({
  t,
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
  showReplayControls,
  replayVideoAutoplayAndLoopOff,
  useVideoInput,

  onTurnOnCamera,
  onTurnOffCamera,
  onOpenVideoInput,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onStopReplaying,
  onConfirm
}: RenderActionsProps & { onConfirm?: () => void }) => {
  // Called as a plain function by VideoRecorder (not rendered as a
  // component), so no hooks here: VideoRecorder injects the styles.
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
        <Button
          type='button'
          onClick={onStopReplaying}
          data-qa='start-replaying'
        >
          {t('Use another video')}
        </Button>
      )
    }

    if (isRecording) {
      return (
        <StopButton
          type='button'
          onClick={onStopRecording}
          data-qa='stop-recording'
        />
      )
    }

    if (isCameraOn && streamIsReady) {
      return (
        <RecordButton
          t={t}
          type='button'
          onClick={onStartRecording}
          data-qa='start-recording'
        />
      )
    }

    if (useVideoInput) {
      return (
        <Button type='button' onClick={onOpenVideoInput} data-qa='open-input'>
          {t('Upload a video')}
        </Button>
      )
    }

    return shouldUseVideoInput
      ? (
          <Button type='button' onClick={onOpenVideoInput} data-qa='open-input'>
            {t('Record a video')}
          </Button>
        )
      : (
          <Button type='button' onClick={onTurnOnCamera} data-qa='turn-on-camera'>
            {t('Turn my camera ON')}
          </Button>
        )
  }

  return (
    <div>
      {isRecording && <Timer timeLimit={timeLimit} />}
      {isRunningCountdown && <Countdown countdownTime={countdownTime} />}
      <div className='rvr-actions'>{renderContent()}</div>
    </div>
  )
}

Actions.propTypes = {
  t: PropTypes.func,
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
  onConfirm: PropTypes.func
}

export default Actions
