function SectionHeader({ props:{ title, subtitle } }) {
  return (
    <div className="SectionHeader">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  )
}

export default SectionHeader
