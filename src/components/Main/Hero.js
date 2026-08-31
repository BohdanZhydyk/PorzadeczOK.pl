import { smoothScrollToId } from '../../AppFunc'

function Hero({ props:{ t } }) {

  const { eyebrow, title, subtitle, ctaPrimary, ctaSecondary, stats } = t.hero
  const handleCtaClick = (event, id) => {
    event.preventDefault()
    smoothScrollToId(id)
  }

  return (
    <section className="Hero flex wrap alignCenter">

      <div className="HeroContent HeroItem flex column">
        <p className="Eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="Lead">{subtitle}</p>
      </div>

      <div className="HeroContent HeroSide HeroItem flex column alignEnd">

        <div className="HeroActions flex wrap end">
          <a className="Btn Primary flex alignCenter center HeroActionItem" href="#kontakt" onClick={(event) => handleCtaClick(event, 'kontakt')}>{ctaPrimary}</a>
          <a className="Btn Ghost flex alignCenter center HeroActionItem" href="#uslugi" onClick={(event) => handleCtaClick(event, 'uslugi')}>{ctaSecondary}</a>
        </div>

        <div className="HeroStats flex wrap end">
        {
          stats.map((stat) => {
            const { label, value } = stat
            return(
              <div className="Stat flex column" key={label}>
                <span className="StatValue">{value}</span>
                <span className="StatLabel">{label}</span>
              </div>
            )
          })
        }
        </div>
        
      </div>

    </section>
  )
}

export default Hero
