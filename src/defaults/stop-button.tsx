'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { cx, useStyles } from '../styles.ts'

export interface StopButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Ignored. Accepted for compatibility with 3.x. */
  color?: string
  /** Ignored. Accepted for compatibility with 3.x. */
  backgroundColor?: string
}

const StopButton = ({
  className,
  color,
  backgroundColor,
  ...props
}: StopButtonProps) => {
  useStyles()
  return (
    <div className='rvr-stop-button'>
      <button className={cx('rvr-stop-button__button', className)} {...props} />
    </div>
  )
}

export default StopButton
