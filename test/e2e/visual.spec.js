import { expect, test } from '@playwright/test'
import { openHarness, qa } from './helpers'

// Screenshots of every view and overlay. The baselines were taken from the
// 3.x styled-components UI, which the plain CSS matches pixel for pixel.
// Run with `yarn test:visual`; baselines are macOS-specific, so CI skips this
// project.

test.use({ viewport: { width: 640, height: 480 } })

// The camera feed and replay change from frame to frame, so their pixels are
// hidden while keeping the layout. (toHaveScreenshot's `style` option doesn't
// reach <video> frames in Chromium, so the CSS goes into the page itself.)
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style')
      style.textContent = 'video { visibility: hidden !important; }'
      document.head.appendChild(style)
    })
  })
})

const screenshot = (page, name) => expect(page).toHaveScreenshot(`${name}.png`)

const addSecondCamera = () => {
  const enumerateDevices = navigator.mediaDevices.enumerateDevices.bind(
    navigator.mediaDevices
  )
  navigator.mediaDevices.enumerateDevices = async () => [
    ...(await enumerateDevices()),
    {
      kind: 'videoinput',
      deviceId: 'second-camera',
      label: 'Second camera',
      groupId: 'second'
    }
  ]
}

test('disconnected', async ({ page }) => {
  await openHarness(page)
  await page.locator(qa('turn-on-camera')).waitFor()
  await screenshot(page, 'disconnected')
})

test('loading', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => new Promise(() => {})
  })
  await openHarness(page)
  await page.click(qa('turn-on-camera'))
  await page.getByText('Loading...').waitFor()
  await screenshot(page, 'loading')
})

test('error', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () =>
      Promise.reject(
        Object.assign(new Error('denied'), { name: 'NotAllowedError' })
      )
  })
  await openHarness(page)
  await page.click(qa('turn-on-camera'))
  await page.getByText('Oh snap!').waitFor()
  await screenshot(page, 'error')
})

test('unsupported', async ({ page }) => {
  await page.addInitScript(() => {
    delete window.MediaRecorder
  })
  await openHarness(page)
  await page.getByText('This browser is uncapable of recording video').waitFor()
  await screenshot(page, 'unsupported')
})

test('native camera fallback', async ({ page }) => {
  await page.addInitScript(() => {
    delete window.MediaRecorder
    Object.defineProperty(HTMLInputElement.prototype, 'capture', {
      configurable: true,
      get() {
        return this.getAttribute('capture') || ''
      }
    })
  })
  await openHarness(page)
  await page.locator(qa('open-input')).waitFor()
  await screenshot(page, 'native-camera-fallback')
})

test('useVideoInput', async ({ page }) => {
  await openHarness(page, { useVideoInput: true })
  await page.locator(qa('open-input')).waitFor()
  await screenshot(page, 'use-video-input')
})

test('camera, countdown, recording and replay', async ({ page }) => {
  await page.addInitScript(addSecondCamera)
  // A paused clock keeps the countdown and timer still for the screenshots.
  await page.clock.install()
  // With the clock paused, the real recorder hasn't produced data by the time
  // the faked 500ms data check runs.
  await openHarness(page, { dataAvailableTimeout: null })
  await page.click(qa('turn-on-camera'))
  await page.locator('video').waitFor({ state: 'attached' })
  await page.clock.runFor(200)
  await page.locator(qa('start-recording')).waitFor()
  await screenshot(page, 'camera-ready-with-switch-button')

  await page.click(qa('start-recording'))
  await page.getByText('3').waitFor()
  await screenshot(page, 'countdown')

  await page.clock.runFor(3000)
  await page.locator(qa('stop-recording')).waitFor()
  await screenshot(page, 'recording')

  await page.clock.runFor(61000)
  await page.getByText('1:01').waitFor()
  await screenshot(page, 'recording-after-a-minute')

  await page.click(qa('stop-recording'))
  await page.locator(qa('start-replaying')).waitFor()
  await screenshot(page, 'replay')
})

test('camera ready without mirroring', async ({ page }) => {
  await openHarness(page, { isOnInitially: true, isFlipped: false })
  await page.locator(qa('start-recording')).waitFor()
  await screenshot(page, 'camera-ready')
})

test.describe('hover', () => {
  test('default button', async ({ page }) => {
    await openHarness(page)
    await page.hover(qa('turn-on-camera'))
    await screenshot(page, 'hover-button')
  })

  test('record and stop buttons', async ({ page }) => {
    await page.clock.install()
    await openHarness(page, { dataAvailableTimeout: null })
    await page.click(qa('turn-on-camera'))
    await page.locator('video').waitFor({ state: 'attached' })
    await page.clock.runFor(200)
    await page.hover(qa('start-recording'))
    await screenshot(page, 'hover-record-button')

    await page.click(qa('start-recording'))
    await page.clock.runFor(3000)
    await page.hover(qa('stop-recording'))
    await screenshot(page, 'hover-stop-button')
  })
})
