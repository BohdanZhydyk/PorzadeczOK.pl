import './Header.scss'
import { appFiles, langImgs } from '../../AppVar'
import { smoothScrollToId, smoothScrollToTop } from '../../AppFunc'

const logo = `${appFiles}/PorzadeczOK_logo.png`

function Header({ props:{ t, isCompact, lang, onLangToggle } }) {

  const { name, tagline } = t.brand
  const { packages, services, process, contact } = t.nav
  const isPl = lang === 'pl'
  const langFlag = isPl ? `${langImgs}/langImg_en.png` : `${langImgs}/langImg_pl.png`
  const langLabel = isPl ? 'English' : 'Polski'

  const handleNavClick = (event, id) => {
    event.preventDefault()
    smoothScrollToId(id)
  }

  const siteNav = [
    { id: 'pakiety', label: packages },
    { id: 'uslugi', label: services },
    { id: 'proces', label: process },
    { id: 'kontakt', label: contact }
  ]
  
  return (
    <header className={`SiteHeader flex alignCenter between${isCompact ? ' IsCompact' : ''}`}>
      <div className={`SiteHeaderInner flex alignCenter between wrap${isCompact ? ' IsCompact' : ''}`}>

        <button className="Brand flex alignCenter" onClick={smoothScrollToTop} type="button">
          <img className="BrandLogo" src={logo} alt={`${name} logo`} />
          <div className="BrandText flex column alignStretch">
            <span className="BrandName">{name}</span>
            <span className="BrandTagline">{tagline}</span>
          </div>
        </button>

        <nav className="SiteNav flex wrap">
        {
          siteNav.map((item) => {
            const { id, label } = item
            return <a href={`#${id}`} onClick={(event) => handleNavClick(event, id)} key={id}>{label}</a>
          })
        }
        </nav>

        <button className="LangToggle" onClick={onLangToggle} type="button" aria-label={langLabel}>
          <img className="LangFlag" src={langFlag} alt={langLabel} />
        </button>

      </div>
    </header>
  )
}
export default Header
