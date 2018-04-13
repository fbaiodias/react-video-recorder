import React, { Component } from 'react'
import styled from 'styled-components'

const Text = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  font-family: Helvetica, Arial;
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
    const defaultText = this.props.defaultText || '--'
    return <Text {...this.props}>{this.state.human || defaultText}</Text>
  }
}

export default Timer
