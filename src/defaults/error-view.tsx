'use client'

import type { VideoRecorderErrorCode } from '../custom-errors.ts'
import type { Translate } from './render-actions.tsx'

export interface ErrorViewProps {
  errorCode?: VideoRecorderErrorCode | null
  t?: Translate
}

const MESSAGES: Partial<Record<VideoRecorderErrorCode, string>> = {
  'permission-denied':
    "Camera access is blocked. Allow it in your browser's site settings and try again.",
  'no-camera': 'No camera was found. Connect one and try again.',
  'camera-in-use':
    'The camera is in use by another app. Close it and try again.'
}

const ErrorView = ({ errorCode, t }: ErrorViewProps) => {
  // Without a translation (t returns nothing), show the English text.
  const text = (english: string) => (t && t(english)) || english
  const message = errorCode && MESSAGES[errorCode]

  if (message) return <div>{text(message)}</div>

  return (
    <div>
      {text('Oh snap! Your browser failed to record your video.')}
      <br />
      <br />
      {text('Please restart it and try again 👍')}
    </div>
  )
}

export default ErrorView
