import type { Translate } from './defaults/render-actions.tsx'

/**
 * `t(text)` as a string, for attributes like aria-label. Falls back to the
 * English text when there's no `t` or it returns something else (e.g. an
 * element, or undefined for a missing translation).
 */
export const translateText = (t: Translate | undefined, text: string) => {
  const translated = t ? t(text) : text
  return typeof translated === 'string' ? translated : text
}
