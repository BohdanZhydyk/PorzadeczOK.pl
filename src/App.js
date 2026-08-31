import { useEffect, useState } from 'react'
import './App.scss'
import { translatePl } from './translatePl'
import { translateEn } from './translateEn'
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'

function App() {

  const [lang, setLang] = useState(() => {
    const savedLang = window.localStorage.getItem('porzadeczok-lang')
    if (savedLang === 'pl' || savedLang === 'en') return savedLang
    return navigator.language.toLowerCase().startsWith('pl') ? 'pl' : 'en'
  })
  const t = lang === 'pl' ? translatePl : translateEn
  const [isCompact, setIsCompact] = useState(false)

  const handleLangToggle = () => {
    setLang((prev) => (prev === 'pl' ? 'en' : 'pl'))
  }
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.seo.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.seo.description)
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', t.seo.locale)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', t.seo.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', t.seo.description)
    document.querySelector('meta[property="og:image:alt"]')?.setAttribute('content', t.seo.imageAlt)
    window.localStorage.setItem('porzadeczok-lang', lang)
  }, [lang, t])

  useEffect(() => {
    const handleScroll = () => {
      const next = window.scrollY > 40
      setIsCompact((prev) => (prev === next ? prev : next))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="Page flex column">

      <Header props={{ t, isCompact, lang, onLangToggle: handleLangToggle }} />

      <Main props={{ t }} />

      <Footer props={{ t }} />

    </div>
  )
}

export default App
