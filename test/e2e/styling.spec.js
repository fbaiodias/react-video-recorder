import { expect, test } from '@playwright/test'
import { openHarness, qa } from './helpers'

const style = (locator, property) =>
  locator.evaluate(
    (element, name) => getComputedStyle(element).getPropertyValue(name),
    property
  )

test('app styles win over the defaults, whatever their specificity', async ({
  page
}) => {
  await openHarness(page)
  const wrapper = page.locator('.rvr-wrapper')
  await expect(wrapper).toBeVisible()
  expect(await style(wrapper, 'background-color')).toBe('rgb(0, 0, 0)')

  // A type selector is less specific than .rvr-wrapper, but the defaults are
  // in a cascade layer.
  await page.addStyleTag({ content: 'div { background-color: rgb(1, 2, 3) }' })
  expect(await style(wrapper, 'background-color')).toBe('rgb(1, 2, 3)')
})

test('theme variables restyle the default UI', async ({ page }) => {
  await openHarness(page, { isOnInitially: true })
  const record = page.locator(qa('start-recording'))
  await record.waitFor()
  expect(await style(record, 'background-color')).toBe('rgba(227, 73, 28, 0.8)')

  await page.addStyleTag({
    content: ':root { --rvr-accent: rgb(0, 128, 0); --rvr-font-family: serif }'
  })
  expect(await style(record, 'background-color')).toBe('rgb(0, 128, 0)')
  expect(
    await style(page.locator('.rvr-record-button__instructions'), 'font-family')
  ).toBe('serif')
})
