import { useEffect, useState } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import PropTypes from 'prop-types'
import { cx, useStyles } from '../styles.ts'

export interface TimerProps extends ComponentPropsWithoutRef<'div'> {
  /** In milliseconds. When set, the timer counts down from it. */
  timeLimit?: number
  defaultText?: string
}

const pad = (unit: number) => {
  const str = '' + unit
  const pad = '00'
  return pad.substring(0, pad.length - str.length) + str
}

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)

  return minutes !== 0
    ? `${minutes}:${pad(seconds - minutes * 60)}`
    : `${seconds - minutes * 60}s`
}

/** Shows the recording time, or the time left with a timeLimit. */
const Timer = ({ timeLimit, defaultText, className, ...props }: TimerProps) => {
  useStyles()
  const [seconds, setSeconds] = useState(() =>
    timeLimit ? timeLimit / 1000 : 0
  )

  // The direction is set when the timer mounts: a recording's timeLimit
  // doesn't change once it has started.
  const [countsDown] = useState(!!timeLimit)
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((seconds) => (countsDown ? seconds - 1 : seconds + 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [countsDown])

  return (
    <div className={cx('rvr-timer', className)} {...props}>
      <div className='rvr-timer__icon' />
      {formatSeconds(seconds) || defaultText || '0:00'}
    </div>
  )
}

Timer.propTypes = {
  timeLimit: PropTypes.number,
  defaultText: PropTypes.string
}

export default Timer
