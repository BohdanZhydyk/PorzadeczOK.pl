
function getCopyrightYears(){
  const currentYear = new Date().getFullYear()
  return `2018-${currentYear}`
}

function smoothScrollToId(id){
  const target = document.getElementById(id)
  if(!target){
    return
  }

  const header = document.querySelector('.SiteHeader')
  const headerHeight = header ? header.getBoundingClientRect().height : 0
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight

  window.scrollTo({ top, behavior: 'smooth' })
}

function smoothScrollToTop(){
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export { getCopyrightYears, smoothScrollToId, smoothScrollToTop }
