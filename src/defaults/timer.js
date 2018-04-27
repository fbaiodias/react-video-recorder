import React, { Component } from 'react'
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
  margin: 8px 8px;
`

class Timer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      seconds: null,
      minutes: null
    }
  }

  init (running) {
    this.start()
    this.setState({ seconds: 0 })
  }

  componentWillUnmount () {
    this.stop()
  }

  componentDidMount () {
    this.init()
  }

  stop () {
    clearInterval(this.timer)
    this.setState({
      seconds: null,
      human: null
    })
  }

  pad (unit) {
    var str = '' + unit
    var pad = '00'
    return pad.substring(0, pad.length - str.length) + str
  }

  start () {
    this.timer = setInterval(() => {
      const seconds = (this.state.seconds || 0) + 1
      const minutes = Math.floor(seconds / 60)
      const humanTime = `${minutes}:${this.pad(seconds - minutes * 60)}`
      this.setState({
        seconds: seconds,
        human: humanTime
      })
    }, 1000)
  }

  render () {
    const defaultText = this.props.defaultText || '0:00'
    return (
      <Text {...this.props}>
        <RecIcon />
        {this.state.human || defaultText}
      </Text>
    )
  }
}

export default Timer
