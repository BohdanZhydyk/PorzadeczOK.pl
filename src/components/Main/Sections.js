import SectionHeader from './SectionHeader'

function Sections({ t }) {
  return (
    <>
    {
      t.sections.map((section) => {

        const { id, title, subtitle, items } = section

        return(
          <section className="Section" id={id} key={id}>

            <SectionHeader props={{title, subtitle}} />

            <div className="SectionBody">
              <div className="Cards">
              {
                items.map((item) => {

                  const title = item.title
                  const text = item.text.split('\n')
                  
                  return(
                    <article className="Card" key={title}>
                      <h3>{title}</h3>
                      { text.map((line) => <p key={line}>{line}</p> )}
                    </article>
                  )
                })
              }
              </div>
            </div>
            
          </section>
        )
      })
    }
    </>
  )
}

export default Sections
