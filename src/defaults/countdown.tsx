import { useEffect, useState } from 'react'
import { useStyles } from '../styles.ts'

export interface CountdownProps {
  /** In milliseconds */
  countdownTime: number
}

/** Counts down the seconds before recording starts. */
const Countdown = ({ countdownTime }: CountdownProps) => {
  useStyles()
  const [number, setNumber] = useState(countdownTime / 1000)

  useEffect(() => {
    if (number === 0) return
    const timeout = setTimeout(() => setNumber(number - 1), 1000)
    return () => clearTimeout(timeout)
  }, [number])

  return <div className='rvr-countdown'>{number !== 0 ? number : null}</div>
}

export default Countdown
