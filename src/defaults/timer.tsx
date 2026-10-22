import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Text = styled.div`
  position: absolute;
  top: 50px;
  right: 50px;
  font-family: Menlo, monospace;
  font-size: 28px;
  text-shadow: 1px 2px rgba(0, 0, 0, 0.5);
`

const RecIcon = styled.div`
  width: 16px;
  height: 16px;
  background: #e55226;
  border-radius: 50%;
  float: left;
  margin: 2px 8px;
  margin-left: 0;
`

export interface TimerProps {
  /** In milliseconds. When set, the timer counts down from it. */
  timeLimit?: number
  defaultText?: string
}

interface TimerState {
  seconds: number
  human: string
}

class Timer extends Component<TimerProps, TimerState> {
  static propTypes = {
    timeLimit: PropTypes.number,
    defaultText: PropTypes.string
  }

  declare timer: ReturnType<typeof setInterval>

  constructor (props: TimerProps) {
    super(props)

    const nextSeconds = props.timeLimit ? props.timeLimit / 1000 : 0

    this.state = this.getState(nextSeconds)
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }

  componentDidMount () {
    const { timeLimit } = this.props
    this.timer = setInterval(() => {
      const { seconds } = this.state
      const nextSeconds = timeLimit ? seconds - 1 : seconds + 1

      const nextState = this.getState(nextSeconds)
      this.setState(nextState)
    }, 1000)
  }

  pad (unit: number) {
    const str = '' + unit
    const pad = '00'
    return pad.substring(0, pad.length - str.length) + str
  }

  getState (seconds: number): TimerState {
    const minutes = Math.floor(seconds / 60)

    const humanTime =
      minutes !== 0
        ? `${minutes}:${this.pad(seconds - minutes * 60)}`
        : `${seconds - minutes * 60}s`

    return {
      seconds,
      human: humanTime
    }
  }

  render () {
    const defaultText = this.props.defaultText || '0:00'
    return (
      // The props pass through to the styled div, which drops the unknown ones.
      <Text {...(this.props as object)}>
        <RecIcon />
        {this.state.human || defaultText}
      </Text>
    )
  }
}

export default Timer
