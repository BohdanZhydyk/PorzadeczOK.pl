import './Main.scss'
import Hero from './Hero'
import Sections from './Sections'
import Contact from './Contact'

function Main({ props:{ t, lang } }) {
  return (
    <main className="SiteMain flex column">

      <Hero props={{ t }} />

      <Sections props={{ t, lang }} />

      <Contact props={{ t, lang }} />

    </main>
  )
}
export default Main
