import type { ComponentPropsWithoutRef } from 'react'
import PropTypes from 'prop-types'
import type { Translate } from './render-actions.tsx'
import { cx, useStyles } from '../styles.ts'

export interface RecordButtonProps extends ComponentPropsWithoutRef<'button'> {
  t: Translate
  /** Ignored. Accepted for compatibility with 3.x. */
  color?: string
  /** Ignored. Accepted for compatibility with 3.x. */
  backgroundColor?: string
}

const RecordButton = ({
  t,
  className,
  color,
  backgroundColor,
  ...props
}: RecordButtonProps) => {
  useStyles()
  return (
    <div className='rvr-record-button'>
      <div className='rvr-record-button__instructions'>
        <div>{t('PRESS')} </div>
        <div className='rvr-record-button__highlight'> {t('REC')} </div>
        {t('WHEN READY')}
      </div>

      <div className='rvr-record-button__border'>
        <button
          className={cx('rvr-record-button__button', className)}
          {...props}
        />
      </div>
    </div>
  )
}

RecordButton.propTypes = {
  t: PropTypes.func
}

export default RecordButton
