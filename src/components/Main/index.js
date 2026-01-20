import './Main.scss'
import Hero from './Hero'
import Sections from './Sections'
import Contact from './Contact'

function Main({ props:{ t } }) {
  return (
    <main className="SiteMain">

      <Hero props={{ t }} />

      <Sections props={{ t }} />

      <Contact props={{ t }} />

    </main>
  )
}
export default Main
