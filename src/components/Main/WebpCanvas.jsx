import { useEffect, useRef } from 'react'

/**
 * Deterministyczny odtwarzacz animacji WebP na <canvas>.
 *
 * - Odtwarza dokładnie klatki 0 .. N-1 na jednym zegarze (requestAnimationFrame).
 * - Brak osobnych setTimeout — animacja nie może się rozjechać ani zapętlić.
 * - Zdarzenie onEnded wywołuje się dopiero po pełnym wyświetleniu ostatniej klatki.
 * - Zdarzenie onDonePhase wywołuje się na podstawie realnego postępu klatek (70% czasu pliku).
 */
function WebpCanvas({ decoded, alt, className, onDonePhase, onEnded }) {
  const canvasRef = useRef(null)
  const onDonePhaseRef = useRef(onDonePhase)
  const onEndedRef = useRef(onEnded)

  onDonePhaseRef.current = onDonePhase
  onEndedRef.current = onEnded

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !decoded || !decoded.frames.length) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { frames, totalDuration } = decoded
    const doneThreshold = totalDuration * 0.7

    let frameIndex = 0
    let frameElapsed = 0
    let totalElapsed = 0
    let doneEmitted = false
    let lastTime = null
    let rafId = null
    let cancelled = false

    // Natychmiastowe wyrysowanie klatki 0 w pierwszym cyklu malowania
    ctx.putImageData(frames[0].imageData, 0, 0)

    const tick = (now) => {
      if (cancelled) return

      if (lastTime === null) {
        lastTime = now
        rafId = window.requestAnimationFrame(tick)
        return
      }

      // Ograniczenie kroku dt (np. po przełączeniu karty lub uśpieniu ekranu),
      // aby animacja nigdy nie przeskoczyła klatek wychodzenia
      const dt = Math.min(Math.max(0, now - lastTime), 100)
      lastTime = now

      frameElapsed += dt
      totalElapsed += dt

      if (!doneEmitted && totalElapsed >= doneThreshold) {
        doneEmitted = true
        onDonePhaseRef.current?.()
      }

      let frameChanged = false
      while (frameElapsed >= frames[frameIndex].duration) {
        frameElapsed -= frames[frameIndex].duration
        frameIndex += 1
        frameChanged = true

        if (frameIndex >= frames.length) {
          // Ostatnia klatka została wyświetlona przez swój pełny czas — koniec (zero zapętlenia!)
          if (!doneEmitted) {
            doneEmitted = true
            onDonePhaseRef.current?.()
          }
          onEndedRef.current?.()
          return
        }
      }

      if (frameChanged) {
        ctx.putImageData(frames[frameIndex].imageData, 0, 0)
      }

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)

    return () => {
      cancelled = true
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [decoded])

  return (
    <canvas
      ref={canvasRef}
      width={decoded.width}
      height={decoded.height}
      style={{ aspectRatio: `${decoded.width} / ${decoded.height}` }}
      className={className}
      role="img"
      aria-label={alt}
    />
  )
}

export default WebpCanvas
