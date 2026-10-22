import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import { installFakeMedia } from './fake-media'
import { takeConsole } from './console-capture'
import { advance, click, renderRecorder } from './helpers'

// Simulates picking a file the way browsers do: `files` is set, and assigning
// an empty value (or null) clears it again.
function selectFile (input, file) {
  let files = [file]
  Object.defineProperty(input, 'files', {
    configurable: true,
    get: () => files
  })
  Object.defineProperty(input, 'value', {
    configurable: true,
    get: () => (files.length > 0 ? `C:\\fakepath\\${file.name}` : ''),
    set: (value) => {
      if (!value) files = []
    }
  })
  fireEvent.change(input)
}

const videoFile = (name = 'clip.webm', type = 'video/webm') =>
  new File(['video-bytes'], name, { type })

// getVideoInfo() reads duration and a thumbnail from a detached <video>.
// jsdom never loads media, so tests drive that element by hand.
function captureDetachedVideos () {
  const created = []
  const createElement = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
    const element = createElement(tag, options)
    if (tag === 'video') created.push(element)
    return element
  })
  return () => created.filter((element) => !element.isConnected)
}

const inlineUnsupported = () =>
  installFakeMedia({ mediaRecorder: false, inputCapture: true })

describe('falling back to the native camera (no MediaRecorder)', () => {
  it('shows a hidden file input that opens the user-facing camera', async () => {
    const media = inlineUnsupported()
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => {})
    const r = renderRecorder()
    await advance(0)

    const input = r.fileInput()
    expect(input.getAttribute('accept')).toBe('video/*')
    expect(input.getAttribute('capture')).toBe('user')
    expect(input.style.display).toBe('none')
    expect(r.flags()).toMatchObject({
      isInlineRecordingSupported: false,
      isVideoInputSupported: true
    })
    expect(r.byQa('open-input').textContent).toBe('Record a video')

    await click(r.byQa('open-input'))
    expect(r.events).toEqual(['onOpenVideoInput'])
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(clickSpy.mock.contexts[0]).toBe(input)
    expect(media.enumerateDevices).not.toHaveBeenCalled()
  })

  it('replays the picked file and reports it without duration or thumbnail when it cannot be read', async () => {
    inlineUnsupported()
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    const r = renderRecorder()
    await advance(0)
    await click(r.byQa('open-input'))

    const file = videoFile()
    const pickedAt = Date.now()
    await act(async () => selectFile(r.fileInput(), file))
    expect(r.callbacks.onRecordingComplete).not.toHaveBeenCalled()
    // getVideoInfo gives up after 1s.
    await advance(1000)

    expect(r.callbacks.onRecordingComplete).toHaveBeenCalledTimes(1)
    expect(r.callbacks.onRecordingComplete.mock.calls[0]).toEqual([
      file,
      pickedAt,
      null,
      null,
      undefined
    ])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake/1')
    expect(r.video().getAttribute('src')).toBe('blob:fake/2')
    expect(r.fileInput()).not.toBeNull()
    expect(r.byQa('start-replaying').textContent).toBe('Use another video')

    await click(r.byQa('start-replaying'))
    expect(r.video()).toBeNull()
    expect(r.byQa('open-input')).not.toBeNull()
    expect(r.events).toEqual([
      'onOpenVideoInput',
      'onRecordingComplete',
      'onStopReplaying'
    ])
  })

  it('reads duration and thumbnail from the picked file', async () => {
    inlineUnsupported()
    const detachedVideos = captureDetachedVideos()
    const r = renderRecorder()
    await advance(0)

    const file = videoFile()
    await act(async () => selectFile(r.fileInput(), file))
    const [probe] = detachedVideos()
    expect(probe.muted).toBe(true)
    expect(probe.autoplay).toBe(true)
    Object.defineProperty(probe, 'duration', { value: 4.5 })
    await act(async () => probe.dispatchEvent(new Event('loadeddata')))

    const [
      ,
      ,
      thumbnail,
      duration
    ] = r.callbacks.onRecordingComplete.mock.calls[0]
    expect(duration).toBe(4500)
    expect(thumbnail.type).toBe('image/jpeg')
    expect(HTMLMediaElement.prototype.pause.mock.contexts).toContain(probe)
  })

  it('seeks to the end to find the duration when the file reports Infinity', async () => {
    inlineUnsupported()
    const detachedVideos = captureDetachedVideos()
    const r = renderRecorder()
    await advance(0)

    await act(async () => selectFile(r.fileInput(), videoFile()))
    const [probe] = detachedVideos()
    let duration = Infinity
    Object.defineProperty(probe, 'duration', { get: () => duration })
    await act(async () => probe.dispatchEvent(new Event('loadeddata')))
    expect(probe.currentTime).toBe(Number.MAX_SAFE_INTEGER)

    duration = 7.25
    await act(async () => probe.ontimeupdate())
    expect(probe.ontimeupdate).toBeNull()
    expect(probe.currentTime).toBe(0)
    expect(r.callbacks.onRecordingComplete.mock.calls[0][3]).toBe(7250)
  })

  it("passes 'mov' as the extension for QuickTime files", async () => {
    inlineUnsupported()
    const r = renderRecorder()
    await advance(0)
    const file = videoFile('clip.mov', 'video/quicktime')
    await act(async () => selectFile(r.fileInput(), file))
    await advance(1000)
    expect(r.callbacks.onRecordingComplete.mock.calls[0][4]).toBe('mov')
  })

  it('handles the change only once although two listeners are attached', async () => {
    inlineUnsupported()
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    const r = renderRecorder()
    await advance(0)
    // Opening the picker adds a native change listener next to React's onChange.
    await click(r.byQa('open-input'))
    await click(r.byQa('open-input'))

    await act(async () => selectFile(r.fileInput(), videoFile()))
    await advance(1000)
    expect(r.callbacks.onRecordingComplete).toHaveBeenCalledTimes(1)
  })

  it('ignores a change without files', async () => {
    inlineUnsupported()
    const r = renderRecorder()
    await advance(0)
    const input = r.fileInput()
    Object.defineProperty(input, 'files', { value: [] })
    fireEvent.change(input)
    await advance(1000)
    expect(r.callbacks.onRecordingComplete).not.toHaveBeenCalled()
  })

  it('shows the error and lets you pick another file when reading one fails', async () => {
    inlineUnsupported()
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    const detachedVideos = captureDetachedVideos()
    const r = renderRecorder()
    await advance(0)

    await act(async () => selectFile(r.fileInput(), videoFile()))
    const [probe] = detachedVideos()
    Object.defineProperty(probe, 'duration', { value: 3 })
    HTMLCanvasElement.prototype.getContext.mockImplementation(() => null)
    await act(async () => probe.dispatchEvent(new Event('loadeddata')))

    const [error] = r.callbacks.onError.mock.calls[0]
    expect(r.container.textContent).toContain('Oh snap!')
    expect(r.byQa('open-input').textContent).toBe('Record a video')
    expect(takeConsole('error')).toEqual([['Captured error', error]])

    HTMLCanvasElement.prototype.getContext.mockImplementation(() => ({ drawImage: vi.fn() }))
    await click(r.byQa('open-input'))
    await act(async () => selectFile(r.fileInput(), videoFile()))
    expect(r.container.textContent).not.toContain('Oh snap!')
    await advance(1000)
    expect(r.callbacks.onRecordingComplete).toHaveBeenCalledTimes(1)
    expect(r.video()).not.toBeNull()
  })

  it('opens the picker at mount with isOnInitially', async () => {
    inlineUnsupported()
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => {})
    const r = renderRecorder({ isOnInitially: true })
    await advance(0)
    expect(r.events).toEqual(['onOpenVideoInput'])
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('reopens the picker after replaying with isOnInitially', async () => {
    inlineUnsupported()
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => {})
    const r = renderRecorder({ isOnInitially: true })
    await advance(0)
    await act(async () => selectFile(r.fileInput(), videoFile()))
    await advance(1000)

    await click(r.byQa('start-replaying'))
    expect(clickSpy).toHaveBeenCalledTimes(2)
    expect(r.events.slice(-2)).toEqual(['onStopReplaying', 'onOpenVideoInput'])
    expect(r.video()).toBeNull()
  })
})

describe('useVideoInput', () => {
  it('uses a file input without capture even when inline recording works', async () => {
    const media = installFakeMedia()
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    const r = renderRecorder({ useVideoInput: true })
    await advance(0)

    expect(r.fileInput().hasAttribute('capture')).toBe(false)
    expect(r.byQa('open-input').textContent).toBe('Upload a video')
    await click(r.byQa('open-input'))
    expect(r.events).toEqual(['onOpenVideoInput'])
    expect(media.enumerateDevices).not.toHaveBeenCalled()
  })

  it('opens the picker at mount and again after replaying with isOnInitially', async () => {
    const media = installFakeMedia()
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => {})
    const r = renderRecorder({ useVideoInput: true, isOnInitially: true })
    await advance(0)
    expect(clickSpy).toHaveBeenCalledTimes(1)

    await act(async () => selectFile(r.fileInput(), videoFile()))
    await advance(1000)
    await click(r.byQa('start-replaying'))
    expect(clickSpy).toHaveBeenCalledTimes(2)
    expect(media.enumerateDevices).not.toHaveBeenCalled()
    // Unlike the fallback above, this path keeps showing the replay until a
    // new file is picked.
    expect(r.video()).not.toBeNull()
  })
})

describe('unsupported browsers', () => {
  it('shows the unsupported view without buttons when nothing works', async () => {
    installFakeMedia({ mediaRecorder: false, inputCapture: false })
    const r = renderRecorder({ isOnInitially: true })
    await advance(0)

    expect(
      screen.getByText('This browser is uncapable of recording video')
    ).toBeTruthy()
    expect(r.container.querySelectorAll('button')).toHaveLength(0)
    expect(r.fileInput()).toBeNull()
    expect(r.events).toEqual([])
  })

  it('treats a missing navigator.mediaDevices as unsupported', async () => {
    installFakeMedia({ mediaDevices: false })
    renderRecorder()
    await advance(0)
    expect(
      screen.getByText('This browser is uncapable of recording video')
    ).toBeTruthy()
  })
})
