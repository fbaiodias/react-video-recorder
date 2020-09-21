/* eslint-env jest */
/* global page,browser */
const BASE_URL = 'http://localhost:6006'

describe('VideoRecorder', () => {
  jest.setTimeout(10000)

  it('records inline video', async () => {
    const context = browser.defaultBrowserContext()
    await context.overridePermissions(BASE_URL, ['camera', 'microphone'])
    await page.goto(
      `${BASE_URL}/iframe.html?selectedKind=VideoRecorder&selectedStory=with%20default%20config`
    )
    await page.click('[data-qa="turn-on-camera"]')
    await page.waitForSelector('[data-qa="start-recording"]')
    await page.click('[data-qa="start-recording"]')
    await page.waitForSelector('[data-qa="stop-recording"]')
    const DURATION = 1500
    await page.waitFor(DURATION)
    await page.click('[data-qa="stop-recording"]')
    await page.waitForSelector('video')
    const duration = await page.$eval('video', (el) => el.duration)

    expect(duration * 1000).toBeWithinRange(DURATION - 100, DURATION + 100)
  })
})
