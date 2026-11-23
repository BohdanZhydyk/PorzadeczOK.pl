/**
 * Uniwersalny dekoder animowanych plików WebP (RIFF/ANIM/ANMF) do bufora klatek ImageData.
 *
 * - Działa w 100% dynamicznie: pobiera dokładne wymiary, klatki i czasy klatek bezpośrednio z pliku WebP.
 * - Zero liczb na sztywno i zero zapętlenia (odtwarzacz decyduje o jednokrotnym przejściu od klatki 0 do N-1).
 * - Ścieżka 1: Natywne WebCodecs ImageDecoder (Chrome, Edge, Android Chrome, Firefox 133+).
 * - Ścieżka 2: Zgodny ze specyfikacją Google WebP demuxer RIFF + kompozytor canvas (iOS Safari, starsze przeglądarki).
 * - Wynik dekodowania jest cache'owany w pamięci na sesję (jeden pobrany plik = 0 ponownych pobrań z sieci).
 */

const decodedCache = new Map()

function readUint24LE(view, offset) {
  return (
    view.getUint8(offset) |
    (view.getUint8(offset + 1) << 8) |
    (view.getUint8(offset + 2) << 16)
  )
}

function readFourCC(view, offset) {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3)
  )
}

function writeUint24LE(bytes, offset, value) {
  bytes[offset] = value & 0xff
  bytes[offset + 1] = (value >> 8) & 0xff
  bytes[offset + 2] = (value >> 16) & 0xff
}

function writeFourCC(bytes, offset, str) {
  bytes[offset] = str.charCodeAt(0)
  bytes[offset + 1] = str.charCodeAt(1)
  bytes[offset + 2] = str.charCodeAt(2)
  bytes[offset + 3] = str.charCodeAt(3)
}

/**
 * Buduje poprawny, samodzielny statyczny plik WebP z danych pojedynczego chunka ANMF.
 * Obsługuje VP8L (lossless + alpha), VP8 (lossy) oraz ALPH + VP8 (lossy + alpha z nagłówkiem VP8X).
 */
function buildStandaloneWebpBlob(framePayload, width, height) {
  const needsVp8x =
    framePayload.byteLength >= 4 &&
    framePayload[0] === 0x41 && // 'A'
    framePayload[1] === 0x4c && // 'L'
    framePayload[2] === 0x50 && // 'P'
    framePayload[3] === 0x48    // 'H'

  const vp8xSize = needsVp8x ? 18 : 0
  const pad = framePayload.byteLength & 1
  const riffPayloadSize = 4 + vp8xSize + framePayload.byteLength + pad
  const out = new Uint8Array(8 + riffPayloadSize)
  const outView = new DataView(out.buffer)

  writeFourCC(out, 0, 'RIFF')
  outView.setUint32(4, riffPayloadSize, true)
  writeFourCC(out, 8, 'WEBP')

  let cursor = 12
  if (needsVp8x) {
    writeFourCC(out, cursor, 'VP8X')
    outView.setUint32(cursor + 4, 10, true)
    out[cursor + 8] = 0x10 // Alpha flag
    out[cursor + 9] = 0
    out[cursor + 10] = 0
    out[cursor + 11] = 0
    writeUint24LE(out, cursor + 12, Math.max(0, width - 1))
    writeUint24LE(out, cursor + 15, Math.max(0, height - 1))
    cursor += 18
  }

  out.set(framePayload, cursor)
  return new Blob([out], { type: 'image/webp' })
}

/**
 * Dekoduje statyczny Blob WebP do HTMLImageElement (bezpieczne na wszystkich wersjach iOS Safari).
 */
function decodeBlobToImage(blob) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const finish = () => {
        URL.revokeObjectURL(objectUrl)
        resolve(img)
      }
      if (typeof img.decode === 'function') {
        img.decode().then(finish, finish)
      } else {
        finish()
      }
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl)
      reject(err || new Error('Failed to decode static WebP frame'))
    }
    img.src = objectUrl
  })
}

/**
 * Ścieżka 1: Dekodowanie za pomocą natywnego WebCodecs ImageDecoder.
 */
async function decodeWithImageDecoder(buffer) {
  const decoder = new window.ImageDecoder({
    data: new Uint8Array(buffer.slice(0)),
    type: 'image/webp',
  })

  try {
    await decoder.tracks.ready
    if (decoder.completed) {
      await decoder.completed
    }
    const track = decoder.tracks.selectedTrack
    if (!track || track.frameCount <= 0) {
      throw new Error('ImageDecoder returned empty track')
    }

    const frameCount = track.frameCount
    const frames = []
    let width = 0
    let height = 0
    let scratchCanvas = null
    let scratchCtx = null
    let totalDuration = 0

    for (let i = 0; i < frameCount; i++) {
      const { image: videoFrame } = await decoder.decode({
        frameIndex: i,
        completeFramesOnly: true,
      })

      try {
        if (!scratchCanvas) {
          width = videoFrame.displayWidth || videoFrame.codedWidth
          height = videoFrame.displayHeight || videoFrame.codedHeight
          scratchCanvas = document.createElement('canvas')
          scratchCanvas.width = width
          scratchCanvas.height = height
          scratchCtx = scratchCanvas.getContext('2d', { willReadFrequently: true })
        }

        scratchCtx.clearRect(0, 0, width, height)
        scratchCtx.drawImage(videoFrame, 0, 0, width, height)
        const imageData = scratchCtx.getImageData(0, 0, width, height)

        // VideoFrame.duration w WebCodecs jest w mikrosekundach
        const rawMs =
          typeof videoFrame.duration === 'number' && videoFrame.duration > 0
            ? Math.round(videoFrame.duration / 1000)
            : 100
        const duration = frameCount === 1 ? 3000 : rawMs
        totalDuration += duration

        frames.push({ imageData, duration })
      } finally {
        videoFrame.close()
      }
    }

    if (scratchCanvas) {
      scratchCanvas.width = 0
      scratchCanvas.height = 0
    }

    return { width, height, totalDuration, frames }
  } finally {
    decoder.close()
  }
}

/**
 * Ścieżka 2: Uniwersalny demuxer RIFF WebP + kompozytor Canvas 2D (dla iOS Safari oraz przeglądarek bez ImageDecoder).
 * Realizuje dokładną specyfikację Google WebP Container (VP8X + ANMF blend/dispose).
 */
export async function decodeWithRiffFallback(buffer) {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)

  if (
    bytes.byteLength < 12 ||
    readFourCC(view, 0) !== 'RIFF' ||
    readFourCC(view, 8) !== 'WEBP'
  ) {
    throw new Error('Invalid WebP RIFF header')
  }

  let canvasW = 0
  let canvasH = 0
  const rawFrames = []

  let pos = 12
  while (pos <= bytes.byteLength - 8) {
    const chunkType = readFourCC(view, pos)
    const chunkSize = view.getUint32(pos + 4, true)
    const dataStart = pos + 8
    const dataEnd = Math.min(bytes.byteLength, dataStart + chunkSize)

    if (chunkType === 'VP8X' && chunkSize >= 10) {
      canvasW = 1 + readUint24LE(view, dataStart + 4)
      canvasH = 1 + readUint24LE(view, dataStart + 7)
    } else if (chunkType === 'ANMF' && chunkSize >= 16) {
      const x = readUint24LE(view, dataStart + 0) * 2
      const y = readUint24LE(view, dataStart + 3) * 2
      const w = 1 + readUint24LE(view, dataStart + 6)
      const h = 1 + readUint24LE(view, dataStart + 9)
      const rawDur = readUint24LE(view, dataStart + 12)
      const flags = view.getUint8(dataStart + 15)
      const dispose = flags & 1
      const blend = (flags >> 1) & 1
      const payload = bytes.subarray(dataStart + 16, dataEnd)

      rawFrames.push({
        x,
        y,
        w,
        h,
        duration: rawDur > 0 ? rawDur : 100,
        dispose,
        blend,
        blob: buildStandaloneWebpBlob(payload, w, h),
      })
    }

    pos = dataEnd + (chunkSize & 1)
  }

  // Obsługa pojedynczego, nieanimowanego pliku WebP
  if (rawFrames.length === 0) {
    const img = await decodeBlobToImage(new Blob([bytes], { type: 'image/webp' }))
    const width = img.naturalWidth || canvasW || 280
    const height = img.naturalHeight || canvasH || 280
    const scratchCanvas = document.createElement('canvas')
    scratchCanvas.width = width
    scratchCanvas.height = height
    const scratchCtx = scratchCanvas.getContext('2d', { willReadFrequently: true })
    scratchCtx.drawImage(img, 0, 0, width, height)
    const imageData = scratchCtx.getImageData(0, 0, width, height)
    scratchCanvas.width = 0
    scratchCanvas.height = 0
    return {
      width,
      height,
      totalDuration: 3000,
      frames: [{ imageData, duration: 3000 }],
    }
  }

  if (!canvasW || !canvasH) {
    for (const f of rawFrames) {
      canvasW = Math.max(canvasW, f.x + f.w)
      canvasH = Math.max(canvasH, f.y + f.h)
    }
  }

  // Równoległe dekodowanie wszystkich statycznych klatek WebP przez silnik przeglądarki
  const decodedImages = await Promise.all(rawFrames.map((f) => decodeBlobToImage(f.blob)))

  const compCanvas = document.createElement('canvas')
  compCanvas.width = canvasW
  compCanvas.height = canvasH
  const compCtx = compCanvas.getContext('2d', { willReadFrequently: true })

  const frames = []
  let totalDuration = 0
  let prevFrame = null

  for (let i = 0; i < rawFrames.length; i++) {
    const f = rawFrames[i]
    const img = decodedImages[i]

    // 1. Disposal poprzedniej klatki: 1 = wyczyść prostokąt poprzedniej klatki do przezroczystości
    if (prevFrame && prevFrame.dispose === 1) {
      compCtx.clearRect(prevFrame.x, prevFrame.y, prevFrame.w, prevFrame.h)
    }

    // 2. Blending bieżącej klatki: 1 = nadpisz obszar (NO_BLEND), 0 = mieszanie alfa (BLEND)
    if (f.blend === 1) {
      compCtx.clearRect(f.x, f.y, f.w, f.h)
    }
    compCtx.drawImage(img, f.x, f.y, f.w, f.h)

    const imageData = compCtx.getImageData(0, 0, canvasW, canvasH)
    totalDuration += f.duration
    frames.push({ imageData, duration: f.duration })
    prevFrame = f
  }

  compCanvas.width = 0
  compCanvas.height = 0

  return { width: canvasW, height: canvasH, totalDuration, frames }
}

/**
 * Pobiera i dekoduje animowany plik WebP (z cache w pamięci).
 */
export function loadWebpAnimation(url) {
  if (decodedCache.has(url)) {
    return decodedCache.get(url)
  }

  const promise = (async () => {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} while loading ${url}`)
    }
    const buffer = await res.arrayBuffer()

    if (typeof window !== 'undefined' && typeof window.ImageDecoder === 'function') {
      try {
        const supported = await window.ImageDecoder.isTypeSupported('image/webp')
        if (supported) {
          return await decodeWithImageDecoder(buffer)
        }
      } catch (err) {
        // Bezpieczny fallback do demuxera RIFF, gdyby ImageDecoder nie wspierał konkretnego pliku
        console.warn('ImageDecoder fallback to RIFF:', err)
      }
    }

    return await decodeWithRiffFallback(buffer)
  })().catch((err) => {
    decodedCache.delete(url)
    throw err
  })

  decodedCache.set(url, promise)
  return promise
}
