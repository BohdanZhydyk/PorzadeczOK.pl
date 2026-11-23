import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import SectionHeader from './SectionHeader'
import { CARD_ANIMATIONS } from './CardAnimations'
import { loadWebpAnimation } from './webpDecoder'
import WebpCanvas from './WebpCanvas'

function Sections({ props: { t, lang } }) {
  const currentLang = lang === 'en' ? 'en' : 'pl'

  // Zbierz unikalne klucze wszystkich kafelków (stabilne przy przełączaniu języka PL/EN)
  const cardKeysSignature = t.sections
    .flatMap((section) => section.items.map((_, itemIdx) => `${section.id}-${itemIdx}`))
    .join('|')

  const allCardKeys = useMemo(
    () => (cardKeysSignature ? cardKeysSignature.split('|') : []),
    [cardKeysSignature]
  )

  const [activeCycle, setActiveCycle] = useState(null)
  const [animPhase, setAnimPhase] = useState('idle') // 'idle' | 'cleaning' | 'done'

  const lastCardKeyRef = useRef(null)
  const lastAnimIndexRef = useRef(-1)
  const cycleIdRef = useRef(0)
  const pauseTimerRef = useRef(null)
  const isMountedRef = useRef(false)

  const scheduleNextCycle = useCallback((delayMs, startFn) => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current)
    }
    pauseTimerRef.current = window.setTimeout(() => {
      pauseTimerRef.current = null
      startFn()
    }, delayMs)
  }, [])

  const startNextCycle = useCallback(async () => {
    if (!isMountedRef.current || !allCardKeys.length || !CARD_ANIMATIONS.length) return

    const myCycleId = ++cycleIdRef.current

    // 1. Losowy kafelek (inny niż poprzedni)
    const cardPool = allCardKeys.filter((k) => k !== lastCardKeyRef.current)
    const nextCard = cardPool[Math.floor(Math.random() * cardPool.length)] || allCardKeys[0]

    // 2. Losowa dziewczyna (inna niż poprzednia)
    const animPool = CARD_ANIMATIONS.map((_, idx) => idx).filter(
      (idx) => idx !== lastAnimIndexRef.current
    )
    const nextAnimIdx =
      animPool.length > 0 ? animPool[Math.floor(Math.random() * animPool.length)] : 0

    const chosenAnim = CARD_ANIMATIONS[nextAnimIdx] || CARD_ANIMATIONS[0]

    try {
      // 3. Zdekoduj klatki i czasy prosto z pliku WebP ZANIM pokażemy dziewczynę (cache w RAM po 1. razie)
      const decoded = await loadWebpAnimation(chosenAnim.src)

      if (!isMountedRef.current || cycleIdRef.current !== myCycleId) return

      lastCardKeyRef.current = nextCard
      lastAnimIndexRef.current = nextAnimIdx

      setAnimPhase('cleaning')
      setActiveCycle({
        cycleId: myCycleId,
        cardKey: nextCard,
        animIndex: nextAnimIdx,
        decoded,
      })
    } catch (err) {
      if (!isMountedRef.current || cycleIdRef.current !== myCycleId) return
      console.warn('Nie udało się załadować animacji WebP, ponawiam:', err)
      scheduleNextCycle(4000, startNextCycle)
    }
  }, [allCardKeys, scheduleNextCycle])

  const handleDonePhase = useCallback(() => {
    if (!isMountedRef.current) return
    setAnimPhase('done')
  }, [])

  const handleAnimEnded = useCallback(() => {
    if (!isMountedRef.current) return
    setAnimPhase('idle')
    setActiveCycle(null)
    // Pauza 3s po całkowitym zakończeniu animacji przed kolejnym losowym kafelkiem
    scheduleNextCycle(3000, startNextCycle)
  }, [scheduleNextCycle, startNextCycle])

  useEffect(() => {
    isMountedRef.current = true
    if (allCardKeys.length && CARD_ANIMATIONS.length) {
      scheduleNextCycle(1200, startNextCycle)
    }

    return () => {
      isMountedRef.current = false
      cycleIdRef.current += 1
      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current)
        pauseTimerRef.current = null
      }
    }
  }, [allCardKeys, scheduleNextCycle, startNextCycle])

  const activeAnim =
    activeCycle !== null ? CARD_ANIMATIONS[activeCycle.animIndex] || CARD_ANIMATIONS[0] : null
  const bubbleText =
    activeAnim && animPhase === 'cleaning'
      ? activeAnim.messages.cleaning[currentLang]
      : activeAnim && animPhase === 'done'
      ? activeAnim.messages.done[currentLang]
      : ''

  return (
    <>
      {t.sections.map((section) => {
        const { id, title, subtitle, items } = section

        return (
          <section className="Section flex column" id={id} key={id}>
            <SectionHeader props={{ title, subtitle }} />

            <div className="SectionBody">
              <div className="Cards flex wrap">
                {items.map((item, itemIdx) => {
                  const itemTitle = item.title
                  const text = item.text.split('\n')
                  const cardKey = `${id}-${itemIdx}`
                  const isCardActive =
                    activeCycle !== null &&
                    activeCycle.cardKey === cardKey &&
                    animPhase !== 'idle'

                  return (
                    <article className="Card" key={itemTitle}>
                      <h3>{itemTitle}</h3>
                      {text.map((line) => (
                        <p key={line}>{line}</p>
                      ))}

                      {isCardActive && activeAnim && (
                        <div className="CardCleaner">
                          {bubbleText && (
                            <div className="CardCleanerBubble">{bubbleText}</div>
                          )}
                          <WebpCanvas
                            key={`cleaner-${activeCycle.cycleId}`}
                            decoded={activeCycle.decoded}
                            className="CardCleanerWebp"
                            alt={activeAnim.alt}
                            onDonePhase={handleDonePhase}
                            onEnded={handleAnimEnded}
                          />
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

export default Sections
