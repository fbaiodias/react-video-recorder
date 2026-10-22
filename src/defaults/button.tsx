import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, CSSProperties } from 'react'
import { cx, useStyles } from '../styles.ts'

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Text color. Default: black */
  color?: string
  /** Default: white */
  backgroundColor?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button (
  { color, backgroundColor, className, style, ...props },
  ref
) {
  useStyles()
  return (
    <button
      ref={ref}
      className={cx('rvr-button', className)}
      style={
        {
          '--rvr-button-color': color,
          '--rvr-button-background': backgroundColor,
          ...style
        } as CSSProperties
      }
      {...props}
    />
  )
})

export default Button
