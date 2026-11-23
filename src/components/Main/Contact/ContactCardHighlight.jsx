import { useState, useEffect, useRef, useMemo } from 'react'
import { appFiles } from '../../../AppVar'
import fixlyData from './fixlyReviews.json'

const fixlyIcon = `${appFiles}/contacts/fixly.png`

function ContactCardHighlight({ props: { t, lang = 'pl' } }) {
  const { summary, reviews, sourceUrl } = fixlyData
  const contactT = t.contact || {}

  // Filter reviews with non-empty content
  const reviewPool = useMemo(() => {
    return reviews.filter(
      (r) => r.content && (typeof r.content === 'string' || r.content.pl || r.content.en)
    )
  }, [reviews])

  // Display 2 reviews concurrently
  const [displayedReviews, setDisplayedReviews] = useState(() => [
    reviewPool[0] || null,
    reviewPool[1] || null,
  ])
  const [animatingSlot, setAnimatingSlot] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [expandedReviews, setExpandedReviews] = useState({})

  const displayedReviewsRef = useRef(displayedReviews)
  displayedReviewsRef.current = displayedReviews

  // Automatic random rotation every 4.8 seconds (paused on hover or when a review is expanded)
  const hasExpanded = Object.values(expandedReviews).some(Boolean)

  useEffect(() => {
    if (reviewPool.length <= 2 || isPaused || hasExpanded) return

    const interval = setInterval(() => {
      // Choose slot 0 or 1 randomly
      const slotToReplace = Math.random() < 0.5 ? 0 : 1
      const currentIds = displayedReviewsRef.current
        .filter(Boolean)
        .map((r) => r.id)
      const availableReviews = reviewPool.filter((r) => !currentIds.includes(r.id))

      if (availableReviews.length === 0) return

      const randomNext =
        availableReviews[Math.floor(Math.random() * availableReviews.length)]

      // Trigger fade out
      setAnimatingSlot(slotToReplace)

      setTimeout(() => {
        setDisplayedReviews((prev) => {
          const next = [...prev]
          next[slotToReplace] = randomNext
          return next
        })
        // Clear expansion for replaced slot
        setExpandedReviews((prev) => ({
          ...prev,
          [slotToReplace]: false,
        }))
        // Smooth fade-in
        setTimeout(() => {
          setAnimatingSlot(null)
        }, 60)
      }, 260)
    }, 4800)

    return () => clearInterval(interval)
  }, [reviewPool, isPaused, hasExpanded])

  // Manual shuffle handler for individual card
  const handleShuffle = (slotIndex) => {
    const currentIds = displayedReviewsRef.current
      .filter(Boolean)
      .map((r) => r.id)
    const availableReviews = reviewPool.filter((r) => !currentIds.includes(r.id))
    if (availableReviews.length === 0) return

    const randomNext =
      availableReviews[Math.floor(Math.random() * availableReviews.length)]

    setAnimatingSlot(slotIndex)
    setTimeout(() => {
      setDisplayedReviews((prev) => {
        const next = [...prev]
        next[slotIndex] = randomNext
        return next
      })
      setExpandedReviews((prev) => ({
        ...prev,
        [slotIndex]: false,
      }))
      setTimeout(() => setAnimatingSlot(null), 60)
    }, 240)
  }

  const toggleExpand = (slotIndex) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [slotIndex]: !prev[slotIndex],
    }))
  }

  const getCategory = (rev) => {
    if (!rev || !rev.category) return ''
    if (typeof rev.category === 'string') return rev.category
    return rev.category[lang] || rev.category.pl || ''
  }

  const getContent = (rev) => {
    if (!rev || !rev.content) return ''
    if (typeof rev.content === 'string') return rev.content
    return rev.content[lang] || rev.content.pl || ''
  }

  const renderStars = (rating) => {
    const r = Math.min(5, Math.max(1, rating || 5))
    return '★'.repeat(r) + '☆'.repeat(5 - r)
  }

  return (
    <div
      className="ContactCard Highlight ReviewsCard flex column"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header with Fixly Score */}
      <div className="ReviewsCardHeader flex alignCenter">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="ReviewsFixlyBadge flex alignCenter"
          title="Fixly.pl"
        >
          <img className="HighlightIcon" src={fixlyIcon} alt="Fixly" />
        </a>

        <div className="ReviewsScoreInfo flex column">
          <div className="ReviewsScoreRow flex alignCenter">
            <span className="ReviewsRatingNumber">{summary.averageRating.toFixed(1)}</span>
            <span className="ReviewsRatingStars" aria-label={`${summary.averageRating} na 5 gwiazdek`}>
              ★★★★★
            </span>
            <span className="ReviewsScale">/ 5.0</span>
          </div>
          <div className="ReviewsMetaRow flex alignCenter">
            <span className="ReviewsCount">{contactT.reviewsCount || `${summary.totalReviews} opinii`}</span>
            <span className="ReviewsDot">•</span>
            <span className="ReviewsVerifiedLabel">Fixly</span>
          </div>
        </div>

        <a
          className="ReviewsHeaderCtaBtn"
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {contactT.highlightCta || 'Zobacz profil ↗'}
        </a>
      </div>

      {/* Dynamic Reviews Rotator (2 cards) */}
      <div className="ReviewsContainer flex column">
        {displayedReviews.map((review, slotIndex) => {
          if (!review) return null
          const isSlotAnimating = animatingSlot === slotIndex
          const isExpanded = !!expandedReviews[slotIndex]
          const reviewText = getContent(review)
          const categoryText = getCategory(review)
          const isLongReview = reviewText.length > 150

          return (
            <div
              key={`slot-${slotIndex}-${review.id}`}
              className={`ReviewItem flex column ${isSlotAnimating ? 'is-fading' : 'is-visible'} ${isExpanded ? 'is-expanded' : ''}`}
            >
              <div className="ReviewItemTop flex alignCenter">
                <span className="ReviewItemStars">{renderStars(review.rating)}</span>
                {categoryText && (
                  <span className="ReviewItemCategory">{categoryText}</span>
                )}
                <button
                  type="button"
                  className="ReviewItemShuffleBtn"
                  onClick={() => handleShuffle(slotIndex)}
                  title={contactT.reviewsShuffle || 'Zmień opinię'}
                  aria-label="Następna opinia"
                >
                  ↻
                </button>
              </div>

              <blockquote className="ReviewItemContent">
                “{reviewText}”
              </blockquote>

              {isLongReview && (
                <button
                  type="button"
                  className="ReviewExpandBtn"
                  onClick={() => toggleExpand(slotIndex)}
                >
                  {isExpanded
                    ? (contactT.reviewsShowLess || 'zwiń ▴')
                    : (contactT.reviewsReadMore || 'czytaj więcej ▾')}
                </button>
              )}

              <div className="ReviewItemFooter flex alignCenter">
                <span className="ReviewAuthorName">{review.author}</span>
                {review.city && <span className="ReviewAuthorCity">• {review.city}</span>}
                <span className="ReviewItemVerifiedBadge">
                  ✓ {contactT.reviewsVerified || 'Zweryfikowany klient'}
                </span>
                {review.date && (
                  <time className="ReviewItemDate" dateTime={review.date}>
                    {review.date}
                  </time>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Info / Controls */}
      <div className="ReviewsCardFooter flex alignCenter">
        <span className="ReviewsCardHint">
          {contactT.reviewsAutoRotate || 'Opinie zmieniają się automatycznie'}
        </span>
        <a
          className="Btn Primary ReviewsFullCta flex alignCenter center"
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {contactT.highlightCta || 'Zobacz profil na Fixly ↗'}
        </a>
      </div>
    </div>
  )
}

export default ContactCardHighlight
