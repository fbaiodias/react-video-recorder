import { vi } from 'vitest'

// Stand-ins for the browser media APIs that jsdom doesn't implement. They
// follow the browser's event order closely enough for the component's logic:
// MediaRecorder emits `dataavailable` every `timeslice` ms while recording and,
// after stop(), one last `dataavailable` followed by `stop` in a later task.

export const videoDevice = (deviceId, label = deviceId, facingMode) => ({
  kind: 'videoinput',
  deviceId,
  label,
  groupId: 'group',
  // Not part of MediaDeviceInfo; the fake stream reports it in getSettings().
  facingMode
})

export const audioDevice = (deviceId) => ({
  kind: 'audioinput',
  deviceId,
  label: deviceId,
  groupId: 'group'
})

export const mediaError = (name, message = name) =>
  Object.assign(new Error(message), { name })

export class FakeMediaStreamTrack {
  constructor(kind, settings = {}) {
    this.kind = kind
    this.settings = settings
    this.readyState = 'live'
    this.stop = vi.fn(() => {
      this.readyState = 'ended'
    })
  }

  getSettings() {
    return this.settings
  }
}

export class FakeMediaStream {
  constructor(constraints, videoSettings = {}) {
    this.constraints = constraints
    this.tracks = [
      new FakeMediaStreamTrack('video', videoSettings),
      new FakeMediaStreamTrack('audio')
    ]
  }

  getTracks() {
    return this.tracks
  }

  getVideoTracks() {
    return this.tracks.filter((track) => track.kind === 'video')
  }

  get isStopped() {
    return this.tracks.every((track) => track.readyState === 'ended')
  }
}

export function createFakeMediaRecorder(media) {
  return class FakeMediaRecorder extends EventTarget {
    static isTypeSupported = vi.fn((type) =>
      media.supportedMimeTypes.includes(type)
    )

    constructor(stream, options = {}) {
      super()
      if (media.createRecorderError) throw media.createRecorderError
      this.stream = stream
      this.options = options
      this.mimeType = options.mimeType || 'video/webm'
      this.state = 'inactive'
      this.calls = []
      this.chunkCount = 0
      media.recorders.push(this)
    }

    get emitsData() {
      return media.recorderEmitsData
    }

    start(timeslice) {
      this.calls.push(['start', timeslice])
      this.state = 'recording'
      this.interval = setInterval(() => {
        if (this.state === 'recording') this.emitChunk()
      }, timeslice)
    }

    pause() {
      this.calls.push(['pause'])
      this.state = 'paused'
    }

    resume() {
      this.calls.push(['resume'])
      this.state = 'recording'
    }

    stop() {
      this.calls.push(['stop'])
      this.state = 'inactive'
      clearInterval(this.interval)
      // Browsers fire these in a later task. A microtask keeps durations exact
      // under fake timers, which turn a 0ms timeout set mid-tick into 1ms.
      void Promise.resolve().then(() => {
        this.emitChunk()
        this.dispatchEvent(new Event('stop'))
      })
    }

    emitChunk() {
      if (!this.emitsData) return
      this.chunkCount += 1
      const event = new Event('dataavailable')
      event.data = media.makeChunk(this.chunkCount, this.mimeType)
      this.dispatchEvent(event)
    }

    emitError() {
      const event = new Event('error')
      this.dispatchEvent(event)
      return event
    }
  }
}

const inputCaptureDescriptor = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'capture'
)

export function installFakeMedia({
  devices = [videoDevice('camera-1'), audioDevice('mic-1')],
  mediaRecorder = true,
  mediaDevices = true,
  inputCapture = false,
  recorderEmitsData = true,
  // Like browsers, list cameras with empty ids until access is granted.
  hideDeviceIdsUntilPermission = false,
  // When a <video> fires `playing` after getting a camera stream, in ms, or
  // null for never (jsdom doesn't play media).
  videoPlaysAfter = 0,
  supportedMimeTypes = [
    'video/webm;codecs="vp8,opus"',
    'video/webm;codecs=h264',
    'video/webm;codecs=vp9',
    'video/webm',
    'video/mp4'
  ]
} = {}) {
  const media = {
    devices,
    recorderEmitsData,
    supportedMimeTypes,
    streams: [],
    recorders: [],
    createRecorderError: null,
    makeChunk: (count, type) => new Blob([`chunk-${count}`], { type }),
    get lastStream() {
      return this.streams[this.streams.length - 1]
    },
    get lastRecorder() {
      return this.recorders[this.recorders.length - 1]
    }
  }

  media.enumerateDevices = vi.fn(() =>
    Promise.resolve(
      hideDeviceIdsUntilPermission && media.streams.length === 0
        ? media.devices.map((device) => ({ ...device, deviceId: '' }))
        : media.devices
    )
  )
  media.getUserMedia = vi.fn((constraints) => {
    const cameras = media.devices.filter(
      (device) => device.kind === 'videoinput'
    )
    const exact = constraints.video && constraints.video.deviceId
    const requestedId = exact && (exact.exact ?? exact)
    const camera = requestedId
      ? cameras.find((device) => device.deviceId === requestedId)
      : cameras.find(
          (device) => device.facingMode === constraints.video?.facingMode
        ) || cameras[0]
    if (constraints.video && !camera) {
      return Promise.reject(
        mediaError(requestedId ? 'OverconstrainedError' : 'NotFoundError')
      )
    }
    const stream = new FakeMediaStream(
      constraints,
      camera ? { deviceId: camera.deviceId, facingMode: camera.facingMode } : {}
    )
    media.streams.push(stream)
    return Promise.resolve(stream)
  })

  if (mediaDevices) {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        enumerateDevices: (...args) => media.enumerateDevices(...args),
        getUserMedia: (...args) => media.getUserMedia(...args)
      }
    })
  } else {
    delete navigator.mediaDevices
  }

  const streams = new WeakMap()
  Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', {
    configurable: true,
    get() {
      return streams.get(this) ?? null
    },
    set(stream) {
      streams.set(this, stream)
      if (stream && videoPlaysAfter !== null) {
        setTimeout(
          () => this.dispatchEvent(new Event('playing')),
          videoPlaysAfter
        )
      }
    }
  })

  if (mediaRecorder) {
    media.MediaRecorder = createFakeMediaRecorder(media)
    window.MediaRecorder = media.MediaRecorder
  } else {
    delete window.MediaRecorder
  }

  if (inputCapture) {
    Object.defineProperty(HTMLInputElement.prototype, 'capture', {
      configurable: true,
      get() {
        return this.getAttribute('capture') || ''
      },
      set(value) {
        this.setAttribute('capture', value)
      }
    })
  } else {
    delete HTMLInputElement.prototype.capture
  }

  return media
}

export function uninstallFakeMedia() {
  delete navigator.mediaDevices
  delete window.MediaRecorder
  delete HTMLMediaElement.prototype.srcObject
  if (inputCaptureDescriptor) {
    Object.defineProperty(
      HTMLInputElement.prototype,
      'capture',
      inputCaptureDescriptor
    )
  } else {
    delete HTMLInputElement.prototype.capture
  }
}
