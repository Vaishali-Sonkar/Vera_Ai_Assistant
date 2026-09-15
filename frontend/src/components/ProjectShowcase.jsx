import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import './ProjectShowcase.css'

export function ProjectCarousel({ images, name, suspended = false }) {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [failed, setFailed] = useState({})
  const playing = images.length > 1 && !hovered && !focused && !paused && !reducedMotion && !suspended
  const index = active % Math.max(images.length, 1)
  const move = amount => setActive(current => (current + amount + images.length) % images.length)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(current => (current + 1) % images.length)
    }, 3500)
    return () => window.clearInterval(timer)
  }, [playing, images.length])

  return <div className="project-carousel" role="region" aria-roledescription="carousel" aria-label={`${name} screenshots`}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
    <div className="project-carousel-heading"><span>PRODUCT TOUR</span><span>{images.length ? String(index + 1).padStart(2, '0') : '00'} / {String(images.length).padStart(2, '0')}</span></div>
    <div className="project-slides" aria-live={playing ? 'off' : 'polite'}>
      {images.length ? images.map((image, imageIndex) => <div key={image.src} className={`project-slide${imageIndex === index ? ' is-active' : ''}`}
        role="group" aria-roledescription="slide" aria-label={`${imageIndex + 1} of ${images.length}`} aria-hidden={imageIndex !== index}>
        {failed[image.src] ? <div className="project-image-placeholder"><span aria-hidden="true">VR</span><strong>{name}</strong><p>Project preview coming soon</p></div>
          : <img src={image.src} alt={image.alt} onError={() => setFailed(current => ({ ...current, [image.src]: true }))}/>}
      </div>) : <div className="project-image-placeholder"><strong>{name}</strong><p>Project preview coming soon</p></div>}
    </div>
    {images.length > 1 && <div className="project-carousel-controls">
      <button type="button" className="project-arrow" aria-label="Previous screenshot" onClick={() => move(-1)}>&larr;</button>
      <div className="project-dots">{images.map((image, imageIndex) => <button key={image.src} type="button" aria-label={`Show screenshot ${imageIndex + 1}`} aria-current={imageIndex === index ? 'true' : undefined} onClick={() => setActive(imageIndex)}><span/></button>)}</div>
      {!reducedMotion && <button type="button" className="project-playback" aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Play' : 'Pause'}</button>}
      <button type="button" className="project-arrow" aria-label="Next screenshot" onClick={() => move(1)}>&rarr;</button>
    </div>}
    <p className="project-preview-caption">A closer look at the learning experience</p>
  </div>
}

export function ProjectDetailsModal({ project, onClose, image, subtitle = 'Project Overview' }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const titleId = useId()
  const [closing, setClosing] = useState(false)
  const [documentStatus, setDocumentStatus] = useState('loading')

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    closeRef.current.focus()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    if (!closing) return
    const timer = window.setTimeout(onClose, 180)
    return () => window.clearTimeout(timer)
  }, [closing, onClose])

  useEffect(() => {
    if (image) return
    const controller = new AbortController()
    // Vite serves index.html for absent public assets, so check the media type too.
    fetch(project.pdf, { method: 'HEAD', signal: controller.signal })
      .then(response => setDocumentStatus(response.ok && response.headers.get('content-type')?.toLowerCase().includes('application/pdf') ? 'ready' : 'missing'))
      .catch(error => { if (error.name !== 'AbortError') setDocumentStatus('missing') })
    return () => controller.abort()
  }, [project.pdf, image])

  return <dialog ref={dialogRef} className={`project-modal${closing ? ' is-closing' : ''}`} aria-modal="true" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); setClosing(true) }}
    onClick={event => { if (event.target === event.currentTarget) setClosing(true) }}>
    <div className="project-modal-panel">
      <div className="project-modal-bar"><div><h2 id={titleId}>{project.name}</h2><p>{subtitle}</p></div><button ref={closeRef} type="button" aria-label={image ? 'Close certificate preview' : 'Close project overview'} onClick={() => setClosing(true)}>&times;</button></div>
      <div className="project-pdf-container" onContextMenu={event => event.preventDefault()}>
        {image ? <img className="certificate-full-image" src={image.src} alt={image.alt}/> : documentStatus === 'ready' ? <iframe title={`${project.name} project overview PDF`} src={`${project.pdf}#toolbar=0&navpanes=0&scrollbar=1`} onError={() => setDocumentStatus('missing')}/>
          : <div className="project-document-status" role="status"><strong>{documentStatus === 'loading' ? 'Loading project overview...' : 'Project overview coming soon'}</strong><p>{documentStatus === 'loading' ? 'Preparing the document for reading.' : 'The document is not available right now. Please check back soon.'}</p></div>}
      </div>
    </div>
  </dialog>
}

export default function ProjectShowcase({ project }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const closeDetails = useCallback(() => setDetailsOpen(false), [])
  const headingId = useId()
  return <section className="project-showcase" aria-labelledby={headingId}>
    <ProjectCarousel images={project.images} name={project.name} suspended={detailsOpen}/>
    <div className="project-copy"><p className="eyebrow">FEATURED PROJECT / 01</p><h2 id={headingId}>{project.name}</h2><p className="project-subtitle">{project.subtitle}</p><p className="project-tagline">{project.tagline}</p><p className="project-description">{project.description}</p>
      <div className="project-achievement"><span aria-hidden="true">&#10022;</span><div><strong>{project.achievement.title}</strong><span>{project.achievement.event}</span></div></div>
      <ul className="project-highlights">{project.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>
      <ul className="project-tech" aria-label="Technology stack">{project.tech.map(tech => <li key={tech}>{tech}</li>)}</ul>
      <button type="button" className="project-details-button" aria-haspopup="dialog" onClick={() => setDetailsOpen(true)}>View Details <span aria-hidden="true">&rarr;</span></button>
    </div>
    {detailsOpen && <ProjectDetailsModal project={project} onClose={closeDetails}/>}
  </section>
}
