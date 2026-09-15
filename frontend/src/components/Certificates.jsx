import React, { useCallback, useState } from 'react'
import { certificates } from '../data/certificates'
import { ProjectDetailsModal } from './ProjectShowcase'
import './Certificates.css'

export default function Certificates() {
  const [selected, setSelected] = useState(null)
  const closePreview = useCallback(() => setSelected(null), [])
  return <main className="content-page certificates-page">
    <p className="eyebrow">ACHIEVEMENTS & RECOGNITION</p>
    <h1 className="page-title">Certificates</h1>
    <p className="page-subtitle">Milestones in innovation, problem solving, and collaboration.</p>
    <div className="certificate-list">{certificates.map(certificate => <article key={certificate.id} className="project-showcase certificate-card" aria-labelledby={`${certificate.id}-title`}>
      <button type="button" className="certificate-preview" aria-label={`Preview ${certificate.name}`} aria-haspopup="dialog" onClick={() => setSelected(certificate)}>
        <img src={certificate.image.src} alt={certificate.image.alt}/>
        <span>View certificate <span aria-hidden="true">&nearr;</span></span>
      </button>
      <div className="project-copy">
        <p className="eyebrow">ACHIEVEMENT</p>
        <h2 id={`${certificate.id}-title`} className="certificate-title">{certificate.name}</h2>
        <p className="project-subtitle">{certificate.event}</p>
        <p className="certificate-organization"><abbr title={certificate.organizationFull}>{certificate.organization}</abbr></p>
        <p className="project-description">{certificate.description}</p>
        <div className="project-achievement"><span aria-hidden="true">&#10022;</span><div><strong>{certificate.recognition.title}</strong><p className="certificate-recognition">{certificate.recognition.description}</p></div></div>
        <ul className="project-tech" aria-label="Skills demonstrated">{certificate.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
        <button type="button" className="project-details-button" aria-haspopup="dialog" onClick={() => setSelected(certificate)}>View Certificate <span aria-hidden="true">&rarr;</span></button>
      </div>
    </article>)}</div>
    {selected && <ProjectDetailsModal project={selected} image={selected.image} subtitle="Certificate Preview" onClose={closePreview}/>}
  </main>
}
