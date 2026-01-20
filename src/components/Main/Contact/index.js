import './Contact.scss'
import SectionHeader from '../SectionHeader'
import ContactCard from './ContactCard'
import ContactCardHighlight from './ContactCardHighlight'

function Contact({ t }) {
  
  const { title, subtitle } = t.contact

  return (
    <section className="Section Contact" id="kontakt">

      <SectionHeader props={{title, subtitle}} />

      <div className="SectionBody">
        <div className="ContactGrid">

          <ContactCard t={t} />

          <ContactCardHighlight t={t} />

        </div>
      </div>

    </section>
  )
}

export default Contact
