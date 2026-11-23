import './Footer.scss'
import { getCopyrightYears } from '../../AppFunc'

function Footer({ props:{ t } }) {

  const copyrightDomain = `bzDrive.com`
  const copyrightHref = `https://${copyrightDomain}`
  const { copy, authorLabel, authorName, copyrightLabel } = t.footer
  const copyrightYears = getCopyrightYears()

  return (
    <footer className="SiteFooter flex alignCenter between">

      <span>{copy}</span>

      <span className="FooterSecondary flex column alignEnd">

        <span>{authorLabel} {authorName}</span>

        <span className="FooterSecondaryLine">

          {copyrightLabel} {copyrightYears}{' '}

          <a className="FooterLink" href={copyrightHref} target="_blank" rel="noreferrer">
            {copyrightDomain}
          </a>

        </span>

      </span>

    </footer>
  )
}
export default Footer
