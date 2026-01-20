import { useEffect, useState } from 'react'
import './App.scss'
import { translations } from './translations'
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'

function App() {

  const t = translations.pl
  const [isCompact, setIsCompact] = useState(false)
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

      <Header props={{ t, isCompact }} />

      <Main props={{ t }} />

      <Footer props={{ t }} />

    </div>
  )
}

export default App
