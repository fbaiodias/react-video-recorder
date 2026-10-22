import { expect } from '@playwright/test'

export const qa = (name) => `[data-qa="${name}"]`

export function openHarness (page, props = {}, { pauseControls = false } = {}) {
  const query = new URLSearchParams({ props: JSON.stringify(props) })
  if (pauseControls) query.set('pauseControls', '1')
  return page.goto(`/?${query}`)
}

export const readHarness = (page) => page.evaluate(() => window.__harness)

export async function waitForRecording (page) {
  await expect
    .poll(async () => (await readHarness(page)).recording, { timeout: 10000 })
    .not.toBeNull()
  return readHarness(page)
}

// Duration (ms) the replay <video> reads from the recorded file's metadata.
export async function replayDuration (page) {
  const video = page.locator('video')
  await expect
    .poll(() =>
      video.evaluate(
        (element) =>
          element.readyState >= 1 && Number.isFinite(element.duration)
      )
    )
    .toBe(true)
  return video.evaluate((element) => element.duration * 1000)
}

export function expectNear (actual, expected, tolerance) {
  expect(actual).toBeGreaterThanOrEqual(expected - tolerance)
  expect(actual).toBeLessThanOrEqual(expected + tolerance)
}
