import './Footer.scss'

function Footer({ t, copyrightYears }) {

  const copyrightDomain = `bzDrive.com`
  const copyrightHref = `https://${copyrightDomain}`
  const { copy, authorLabel, authorName, copyrightLabel } = t.footer

  return (
    <footer className="SiteFooter">

      <span>{copy}</span>

      <span className="FooterSecondary">

        <span>{authorLabel} {authorName}</span>

        <span>

          {copyrightLabel} {copyrightYears}{' '}

          <a className="FooterLink" href={copyrightHref} target="_blank" rel="noreferrer">
            copyrightDomain
          </a>

        </span>

      </span>

    </footer>
  )
}
export default Footer
