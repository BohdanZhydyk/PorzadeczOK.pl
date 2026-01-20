import { useEffect, useState } from 'react'
import './App.scss'
import { translations } from './translations'
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'

function App() {

  const t = translations.pl
  const [isCompact, setIsCompact] = useState(false)
  const currentYear = new Date().getFullYear()
  const copyrightYears = `2018-${currentYear}`

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
    <div className="Page">

      <Header t={t} isCompact={isCompact} />

      <Main t={t} />

      <Footer t={t} copyrightYears={copyrightYears} />

    </div>
  )
}

export default App
