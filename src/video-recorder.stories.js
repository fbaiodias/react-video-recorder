import React from 'react'
import { storiesOf } from '@storybook/react'
import styled from 'styled-components'
import { action } from '@storybook/addon-actions'
import VideoRecorder from './video-recorder'

const Wrapper = styled.div`
  height: 100vh;
`
storiesOf('VideoRecorder', module).add('default', () => {
  return (
    <Wrapper>
      <VideoRecorder
        onRecordingComplete={(
          videoBlob,
          startedAt,
          thumbnailBlob,
          duration
        ) => {
          const urlCreator = window.URL || window.webkitURL
          const thumbUrl = urlCreator.createObjectURL(thumbnailBlob)
          const videoUrl = urlCreator.createObjectURL(videoBlob)
          console.log('Video Blob', videoBlob.size, videoBlob, videoUrl)
          console.log('Thumb Blob', thumbnailBlob, thumbUrl)
          console.log('Started:', startedAt)
          console.log('Duration:', duration)
          action('returned')
        }}
      />
    </Wrapper>
  )
})
