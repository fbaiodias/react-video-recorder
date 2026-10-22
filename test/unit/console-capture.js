import { vi } from 'vitest'

// console.error/warn calls are collected instead of printed. A test that
// expects some calls takes them with takeConsole(); anything left over fails
// the test (see setup.js), so new warnings from React or the component don't
// go unnoticed.
const consoleCalls = { error: [], warn: [] }

export function captureConsole () {
  for (const method of Object.keys(consoleCalls)) {
    consoleCalls[method] = []
    vi.spyOn(console, method).mockImplementation((...args) => {
      consoleCalls[method].push(args)
    })
  }
}

export function takeConsole (method) {
  return consoleCalls[method].splice(0)
}

export function assertNoConsoleLeft () {
  const leftover = [...takeConsole('error'), ...takeConsole('warn')]
  if (leftover.length > 0) {
    throw new Error(
      `Unexpected console output:\n${leftover
        .map((args) => args.map(String).join(' '))
        .join('\n')}`
    )
  }
}
