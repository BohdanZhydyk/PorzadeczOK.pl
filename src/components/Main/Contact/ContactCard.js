import ContactLine from './ContactLine'
import { appFiles } from '../../../AppVar'

const telIcon = `${appFiles}/contacts/tel.png`
const emailIcon = `${appFiles}/contacts/email.png`
const fixlyIcon = `${appFiles}/contacts/fixly.png`

function ContactCard({ props:{ t } }) {

  const { phone, email, fixlyUrl, fixlyLabel, cardTitle, cardText } = t.contact
  const tel = `tel:${phone.replace(/\s/g, '')}`
  const mailto = `mailto:${email}`

  const contactLines = [
    { href: tel, icon: telIcon, label: phone },
    { href: mailto, icon: emailIcon, label: email },
    { href: fixlyUrl, icon: fixlyIcon, label: fixlyLabel, isExternal: true }
  ]

  return (
    <div className="ContactCard">

      <h3>{cardTitle}</h3>

      <div className="ContactLines">
      {
        contactLines.map((line) => {
          const { label, href, icon, isExternal } = line
          return <ContactLine props={{ label, href, icon, isExternal }} key={label} /> 
        })
      }
      </div>

      {
        cardText.split('\n').map((line) => {
          return <p className="ContactNote" key={line}>{line}</p>
        })
      }
      
    </div>
  )
}

export default ContactCard
