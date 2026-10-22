import { expect, test } from '@playwright/test'
import {
  expectNear,
  openHarness,
  qa,
  readHarness,
  replayDuration,
  waitForRecording
} from './helpers'

// Real MediaRecorder runs in Chromium and Firefox with their fake cameras.
// Timing tolerances are generous because CI machines are slow; the unit tests
// pin exact durations.

test('records a video inline and replays it', async ({ page }) => {
  await openHarness(page)
  await page.click(qa('turn-on-camera'))
  await page.click(qa('start-recording'))
  await page.locator(qa('stop-recording')).waitFor()
  await page.waitForTimeout(1500)
  await page.click(qa('stop-recording'))

  const { recording, events, errors } = await waitForRecording(page)
  expect(errors).toEqual([])
  expect(events).toEqual([
    'onTurnOnCamera',
    'onCameraOn',
    'onStartRecording',
    'onStopRecording',
    'onTurnOffCamera',
    'onRecordingComplete'
  ])
  expect(recording.argumentCount).toBe(4)
  expect(recording.video.type).toMatch(/^video\/webm/)
  expect(recording.video.size).toBeGreaterThan(1000)
  expect(recording.thumbnail.type).toBe('image/jpeg')
  expect(recording.thumbnail.size).toBeGreaterThan(0)
  expectNear(recording.duration, 1600, 400)

  // fix-webm-duration writes the recorded time into the file's metadata.
  expectNear(await replayDuration(page), recording.duration, 250)
  await expect(page.locator(qa('start-replaying'))).toHaveText(
    'Use another video'
  )
})

test('leaves paused time out of the file duration', async ({ page }) => {
  await openHarness(page, {}, { pauseControls: true })
  await page.click(qa('turn-on-camera'))
  await page.click(qa('start-recording'))
  await page.locator(qa('stop-recording')).waitFor()
  await page.waitForTimeout(800)
  await page.click(qa('harness-pause'))
  await page.waitForTimeout(1000)
  await page.click(qa('harness-resume'))
  await page.waitForTimeout(800)
  await page.click(qa('stop-recording'))

  const { recording, events, errors } = await waitForRecording(page)
  expect(errors).toEqual([])
  expect(events).toContain('onPauseRecording')
  expect(events).toContain('onResumeRecording')
  // onRecordingComplete's duration is wall-clock time, pause included...
  expectNear(recording.duration, 2700, 500)
  // ...while the file only contains the recorded time.
  expectNear(await replayDuration(page), 1700, 400)
})

test('stops at timeLimit and turns the camera on again after replaying', async ({
  page
}) => {
  await openHarness(page, {
    isOnInitially: true,
    timeLimit: 1000,
    countdownTime: 1000
  })
  await page.click(qa('start-recording'))

  const { recording } = await waitForRecording(page)
  expectNear(recording.duration, 1000, 300)
  expectNear(await replayDuration(page), 1000, 300)

  await page.click(qa('start-replaying'))
  await page.locator(qa('start-recording')).waitFor()
  const { events } = await readHarness(page)
  expect(events.slice(-3)).toEqual([
    'onStopReplaying',
    'onTurnOnCamera',
    'onCameraOn'
  ])
})

test('mirrors a user-facing camera but not the replay', async ({ page }) => {
  await openHarness(page, { isOnInitially: true, countdownTime: 0 })
  const transform = () =>
    page
      .locator('video')
      .evaluate((element) => getComputedStyle(element).transform)

  await page.locator(qa('start-recording')).waitFor()
  // Chromium's fake camera reports no facingMode; Firefox's says it's a rear
  // camera, which isn't mirrored.
  const facingMode = await page
    .locator('video')
    .evaluate((element) => element.srcObject.getVideoTracks()[0].getSettings().facingMode)
  expect(await transform()).toMatch(
    facingMode === 'environment' ? /^matrix\(1, 0, 0, 1,/ : /^matrix\(-1, 0, 0, 1,/
  )

  await page.click(qa('start-recording'))
  await page.locator(qa('stop-recording')).waitFor()
  await page.waitForTimeout(500)
  await page.click(qa('stop-recording'))
  await waitForRecording(page)
  expect(await transform()).toMatch(/^matrix\(1, 0, 0, 1,/)
})

test('reports which features the browser supports', async ({ page }) => {
  await openHarness(page)
  const support = await page.evaluate(() => ({
    mediaRecorder: !!window.MediaRecorder,
    mediaDevices: !!navigator.mediaDevices,
    inputCapture: document.createElement('input').capture !== undefined
  }))
  // Desktop browsers record inline; the native-camera fallback is for mobile.
  expect(support).toEqual({
    mediaRecorder: true,
    mediaDevices: true,
    inputCapture: false
  })
  await expect(page.locator(qa('turn-on-camera'))).toBeVisible()
})
