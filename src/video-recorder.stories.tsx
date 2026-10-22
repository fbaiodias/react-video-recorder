import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import VideoRecorder from './video-recorder.tsx'

const logRecording = (
  videoBlob: Blob,
  startedAt: number,
  thumbnailBlob: Blob | null,
  duration: number | null
) => {
  console.log('Video Blob', videoBlob.size, videoBlob, URL.createObjectURL(videoBlob))
  console.log('Thumb Blob', thumbnailBlob, thumbnailBlob && URL.createObjectURL(thumbnailBlob))
  console.log('Started:', startedAt)
  console.log('Duration:', duration)
}

const meta = {
  title: 'VideoRecorder',
  component: VideoRecorder,
  tags: ['autodocs'],
  args: {
    countdownTime: 3000,
    onTurnOnCamera: fn(),
    onTurnOffCamera: fn(),
    onStartRecording: fn(),
    onStopRecording: fn(),
    onRecordingComplete: fn(logRecording),
    onOpenVideoInput: fn(),
    onStopReplaying: fn(),
    onError: fn()
  }
} satisfies Meta<typeof VideoRecorder>

export default meta
type Story = StoryObj<typeof meta>

export const WithDefaultConfig: Story = {
  name: 'with default config'
}

export const WithIsOnInitially: Story = {
  name: 'with isOnInitially=true',
  args: { isOnInitially: true }
}

export const WithUseVideoInput: Story = {
  name: 'with useVideoInput=true isOnInitially=true',
  args: { isOnInitially: true, useVideoInput: true }
}

export const WithoutDataAvailableTimeout: Story = {
  name: 'without dataAvailableTimeout',
  args: { isOnInitially: true, dataAvailableTimeout: null }
}

export const WithShowReplayControls: Story = {
  name: 'with showReplayControls=true',
  args: { isOnInitially: true, showReplayControls: true }
}

export const WithReplayAutoplayAndLoopOff: Story = {
  name: 'with showReplayControls=true replayVideoAutoplayAndLoopOff=true',
  args: {
    isOnInitially: true,
    showReplayControls: true,
    replayVideoAutoplayAndLoopOff: true
  }
}

export const WithIsFlippedFalse: Story = {
  name: 'with isFlipped=false',
  args: { isFlipped: false, showReplayControls: true }
}

export const WithReplayRestrictions: Story = {
  name: 'with showReplayControls=true videoControlsList="nodownload" disablepictureinpicture',
  args: {
    isOnInitially: true,
    showReplayControls: true,
    videoControlsList: 'nodownload',
    disablePictureInPicture: true
  }
}
