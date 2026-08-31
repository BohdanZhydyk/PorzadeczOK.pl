function ContactLine({ props:{ href, icon, label, isExternal } }) {

  const target = isExternal ? '_blank' : undefined
  const rel = isExternal ? 'noreferrer' : undefined

  return (
    <div className="ContactLine flex alignCenter">

      <img className="ContactIcon" src={icon} alt="" aria-hidden="true" />

      <a className="ContactLink" href={href} target={target} rel={rel} >{label}</a>

    </div>
  )
}

export default ContactLine
