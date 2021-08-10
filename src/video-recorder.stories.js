import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, text, number } from '@storybook/addon-knobs'

import VideoRecorder from './video-recorder'

const handleRecordingComplete = (
  videoBlob,
  startedAt,
  thumbnailBlob,
  duration
) => {
  const urlCreator = window.URL || window.webkitURL
  const thumbUrl = thumbnailBlob && urlCreator.createObjectURL(thumbnailBlob)
  const videoUrl = urlCreator.createObjectURL(videoBlob)

  console.log('Video Blob', videoBlob.size, videoBlob, videoUrl)
  console.log('Thumb Blob', thumbnailBlob, thumbUrl)
  console.log('Started:', startedAt)
  console.log('Duration:', duration)

  return action('onRecordingComplete')(
    videoBlob,
    startedAt,
    thumbnailBlob,
    duration
  )
}

const actionLoggers = {
  onTurnOnCamera: action('onTurnOnCamera'),
  onTurnOffCamera: action('onTurnOffCamera'),
  onStartRecording: action('onStartRecording'),
  onStopRecording: action('onStopRecording'),
  onRecordingComplete: handleRecordingComplete,
  onOpenVideoInput: action('onOpenVideoInput'),
  onStopReplaying: action('onStopReplaying'),
  onError: action('onError')
}

const stories = storiesOf('VideoRecorder', module)
stories.addDecorator(withKnobs)

stories.addParameters({
  info: {
    components: {
      VideoRecorder
    },
    styles: {
      children: {
        height: '100%'
      }
    }
  }
})

stories.add('with default config', () => (
  <VideoRecorder
    mimeType={text('mimeType')}
    countdownTime={number('countdownTime', 3 * 1000)}
    timeLimit={number('timeLimit')}
    {...actionLoggers}
  />
))

stories.add('with isOnInitially=true', () => (
  <VideoRecorder
    isOnInitially
    mimeType={text('mimeType')}
    countdownTime={number('countdownTime', 3 * 1000)}
    timeLimit={number('timeLimit')}
    {...actionLoggers}
  />
))

stories.add('with useVideoInput=true isOnInitially=true', () => (
  <VideoRecorder isOnInitially useVideoInput {...actionLoggers} />
))

stories.add('without dataAvailableTimeout', () => (
  <VideoRecorder isOnInitially dataAvailableTimeout={null} {...actionLoggers} />
))

stories.add('with showReplayControls=true', () => (
  <VideoRecorder isOnInitially showReplayControls {...actionLoggers} />
))

stories.add(
  'with showReplayControls=true replayVideoAutoplayAndLoopOff=true',
  () => (
    <VideoRecorder
      isOnInitially
      showReplayControls
      replayVideoAutoplayAndLoopOff
      isReplayVideoInitiallyMuted={false}
      {...actionLoggers}
    />
  )
)

stories.add('with isFlipped=false', () => (
  <VideoRecorder isFlipped={false} showReplayControls {...actionLoggers} />
))

stories.add(
  'with showReplayControls=true videoControlsList="nodownload" disablepictureinpicture',
  () => (
    <VideoRecorder
      isOnInitially
      showReplayControls
      videoControlsList='nodownload'
      disablePictureInPicture
      {...actionLoggers}
    />
  )
)
