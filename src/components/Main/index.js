import './Main.scss'
import Hero from './Hero'
import Sections from './Sections'
import Contact from './Contact'

function Main({ t }) {
  return (
    <main className="SiteMain">

      <Hero t={t} />

      <Sections t={t} />

      <Contact t={t} />

    </main>
  )
}
export default Main
