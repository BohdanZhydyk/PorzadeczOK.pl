import { appFiles } from '../../../AppVar'

const fixlyIcon = `${appFiles}/contacts/fixly.png`

function ContactCardHighlight({ props:{ t } }) {

  const { highlightTitle, highlightText, fixlyUrl, highlightCta } = t.contact
  
  return (
    <div className="ContactCard Highlight">

      <div className="HighlightHeader">
        <img className="HighlightIcon" src={fixlyIcon} alt="" aria-hidden="true" />
        <div>
          <h3>{highlightTitle}</h3>
          <p>{highlightText}</p>
        </div>
      </div>

      <a className="Btn Primary" href={fixlyUrl} target="_blank" rel="noreferrer">
        {highlightCta}
      </a>

    </div>
  )
}

export default ContactCardHighlight
