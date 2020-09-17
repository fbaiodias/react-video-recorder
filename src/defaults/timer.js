import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

// const Text = styled.div`
//   position: absolute;
//   top: -33px;
//   right: 100px;
//   font-family: Menlo, monospace;
//   font-size: 28px;
//   text-shadow: 1px 2px rgba(0, 0, 0, 0.5);
// `

const RecIcon = styled.div`
  width: 16px;
  height: 16px;
  background: #e55226;
  border-radius: 50%;
  float: left;
  margin: 2px 8px;
  margin-left: 0;
`

const RecTimer = styled.div`
  grid-area: 1 / 1;
  z-index: 2;
  display: flex;
  border-radius: 15px;
  place-items: center;
  color: #ffffff;
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: #000;
  padding: 3px 8px;
`

const RecTimerCount = styled.div`
  grid-area: 1 / 1;
`

class Timer extends Component {
  static propTypes = {
    timeLimit: PropTypes.number,
    defaultText: PropTypes.string,
    onTick: PropTypes.func
  }

  constructor (props) {
    super(props)

    const nextSeconds = props.timeLimit ? props.timeLimit / 1000 : 0

    this.state = this.getState(nextSeconds)
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }

  componentDidMount () {
    const { onTick, timeLimit } = this.props
    this.timer = setInterval(() => {
      const { seconds } = this.state
      const nextSeconds = timeLimit ? seconds - 1 : seconds + 1

      const nextState = this.getState(nextSeconds)
      this.setState(nextState, () => {
        onTick(nextState)
      })
    }, 1000)
  }

  pad (unit) {
    var str = '' + unit
    var pad = '00'
    return pad.substring(0, pad.length - str.length) + str
  }

  getState (seconds) {
    const minutes = Math.floor(seconds / 60)

    const humanTime =
      minutes !== 0
        ? `${minutes}:${this.pad(seconds - minutes * 60)}`
        : `${seconds - minutes * 60}s`

    return {
      seconds: seconds,
      human: humanTime
    }
  }

  render () {
    console.log('Timer render: ', this.state.seconds, this.state.human)
    const defaultText = this.props.defaultText || '0:00'
    return (
      <RecTimer>
        <RecIcon />
        <RecTimerCount>{this.state.human || defaultText}</RecTimerCount>
      </RecTimer>
    )
    // return (
    //   <Text {...this.props}>
    //     <RecIcon />
    //     {this.state.human || defaultText}
    //   </Text>
    // )
  }
}

export default Timer
