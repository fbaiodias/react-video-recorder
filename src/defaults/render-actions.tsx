'use client'

import type { ReactNode } from 'react'
import Button from './button.tsx'
import RecordButton from './record-button.tsx'
import StopButton from './stop-button.tsx'
import Timer from './timer.tsx'
import Countdown from './countdown.tsx'
import { translateText } from '../translate.ts'

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
  isPaused: boolean
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
  isPaused,
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
      // With a file input there's nothing to restart: picking another file
      // is the way to retry, so its button stays.
      (thereWasAnError && !useVideoInput && !shouldUseVideoInput) ||
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
          aria-label={translateText(t, 'Stop recording')}
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

    return shouldUseVideoInput ? (
      <Button type='button' onClick={onOpenVideoInput} data-qa='open-input'>
        {t('Record a video')}
      </Button>
    ) : (
      <Button type='button' onClick={onTurnOnCamera} data-qa='turn-on-camera'>
        {t('Turn my camera ON')}
      </Button>
    )
  }

  return (
    <div>
      {isRecording && <Timer timeLimit={timeLimit} isPaused={isPaused} />}
      {isRunningCountdown && <Countdown countdownTime={countdownTime} />}
      <div className='rvr-actions'>{renderContent()}</div>
    </div>
  )
}

export default Actions
