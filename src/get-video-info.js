export const captureThumb = videoTag =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = videoTag.videoWidth
    canvas.height = videoTag.videoHeight
    canvas.getContext('2d').drawImage(
      videoTag,
      0, // top
      0, // left
      videoTag.videoWidth,
      videoTag.videoHeight
    )
    canvas.toBlob(thumbnail => {
      resolve(thumbnail)
    }, 'image/jpeg')
  })

const getVideoInfo = videoBlob =>
  new Promise((resolve, reject) => {
    const videoTag = document.createElement('video')
    videoTag.preload = 'metadata'
    videoTag.muted = true
    videoTag.defaultMuted = true
    videoTag.playsInline = true
    videoTag.autoplay = true

    let resolved = false

    const handleTimeout = () => {
      resolved = true
      resolve({
        duration: null,
        thumbnail: null
      })
      videoTag.removeEventListener &&
        videoTag.removeEventListener('loadeddata', handleLoadedData)
      window.URL.revokeObjectURL(videoTag.src)
    }

    let timeout = setTimeout(handleTimeout, 1000)

    const handleLoadedData = () => {
      const duration = videoTag.duration * 1000

      captureThumb(videoTag)
        .then(thumbnail => {
          videoTag.pause()
          if (!resolved) {
            clearTimeout(timeout)
            resolved = true
            resolve({ duration, thumbnail })
          }
          window.URL.revokeObjectURL(videoTag.src)
        })
        .catch(err => {
          if (!resolved) {
            alert(`thumb error ${err}`)
            clearTimeout(timeout)
            resolved = true
            reject(err)
          }
        })
    }

    videoTag.addEventListener('loadeddata', handleLoadedData)
    videoTag.src = window.URL.createObjectURL(videoBlob)
  })

export default getVideoInfo
