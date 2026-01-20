import './Header.scss'
import logo from '../../AppFiles/PorzadeczOK_logo.png'

function Header({ t, isCompact }) {

  const { name, tagline } = t.brand
  const { services, process, contact, cta } = t.nav
  
  return (
    <header className={`SiteHeader${isCompact ? ' IsCompact' : ''}`}>
      <div className={`SiteHeaderInner${isCompact ? ' IsCompact' : ''}`}>

        <div className="Brand">
          <img className="BrandLogo" src={logo} alt="PorządeczOK logo" />
          <div className="BrandText">
            <span className="BrandName">{name}</span>
            <span className="BrandTagline">{tagline}</span>
          </div>
        </div>

        <nav className="SiteNav">
          <a href="#uslugi">{services}</a>
          <a href="#proces">{process}</a>
          <a href="#kontakt">{contact}</a>
        </nav>

        <a className="HeaderCta" href="#kontakt">{cta}</a>

      </div>
    </header>
  )
}
export default Header
