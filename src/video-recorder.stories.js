import React from 'react'
import { storiesOf } from '@storybook/react'
import styled, { createGlobalStyle } from 'styled-components'
import VideoRecorder from './video-recorder'

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    height: 100%;
    margin: 0;
  }
`

const Wrapper = styled.div`
  height: 100%;
`

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
}

storiesOf('VideoRecorder', module)
  .add('default', () => {
    return (
      <Wrapper>
        <GlobalStyle />
        <VideoRecorder onRecordingComplete={handleRecordingComplete} />
      </Wrapper>
    )
  })
  .add('isOnInitially', () => {
    return (
      <Wrapper>
        <GlobalStyle />
        <VideoRecorder
          isOnInitially
          onRecordingComplete={handleRecordingComplete}
        />
      </Wrapper>
    )
  })
  .add('isOnInitially with timeLimit', () => {
    return (
      <Wrapper>
        <GlobalStyle />
        <VideoRecorder
          isOnInitially
          timeLimit={30 * 1000}
          onRecordingComplete={handleRecordingComplete}
        />
      </Wrapper>
    )
  })
