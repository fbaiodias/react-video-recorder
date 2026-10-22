declare module 'react-svg-inline' {
  import { ComponentType } from 'react'

  export interface SVGInlineProps {
    svg: string
    fill?: string
    className?: string
    component?: string
    classSuffix?: string
    cleanup?: boolean | string[]
    cleanupExceptions?: string[]
    width?: string
    height?: string
    accessibilityLabel?: string
    accessibilityDesc?: string
  }

  const SVGInline: ComponentType<SVGInlineProps>
  export default SVGInline
}
