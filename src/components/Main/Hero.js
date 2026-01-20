function Hero({ t }) {

  const { eyebrow, title, subtitle, ctaPrimary, ctaSecondary, stats } = t.hero

  return (
    <section className="Hero">

      <div className="HeroContent">
        <p className="Eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="Lead">{subtitle}</p>
      </div>

      <div className="HeroContent HeroSide">

        <div className="HeroActions">
          <a className="Btn Primary" href="#kontakt">{ctaPrimary}</a>
          <a className="Btn Ghost" href="#uslugi">{ctaSecondary}</a>
        </div>

        <div className="HeroStats">
        {
          stats.map((stat) => {
            const { label, value } = stat
            return(
              <div className="Stat" key={label}>
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
