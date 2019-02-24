import React from 'react'
import { shallow } from 'enzyme'
import VideoRecorder from './video-recorder'

it('renders without crashing', () => {
  shallow(<VideoRecorder />)
})
