import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projects } from '../data/projects'

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] } },
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const location = useLocation()
  const projectIndex = projects.findIndex((project) => project.slug === slug)
  const project = projects[projectIndex]
  const nextProject = projects[(projectIndex + 1) % projects.length]
  const accent = location.state?.accent || (projectIndex % 2 ? '#FFD60A' : '#FF2E93')
  const origin = location.state?.origin || { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  const originPoint = `${origin.x}px ${origin.y}px`

  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), [slug])

  if (!project) {
    return (
      <main className="not-found page-shell">
        <p className="eyebrow">404 — NOT A PROJECT (YET)</p>
        <h1>Well, this is awkward.</h1>
        <Link className="text-link" to="/">Back to the sphere <span>↗</span></Link>
      </main>
    )
  }

  return (
    <main className="detail-page page-shell">
      <motion.div
        className="detail-reveal"
        initial={{ clipPath: `circle(0px at ${originPoint})` }}
        animate={{ clipPath: `circle(150% at ${originPoint})`, opacity: [1, 1, 0] }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />
      <motion.div variants={reveal} initial="hidden" animate="show" className="detail-heading">
        <Link to="/" className="back-link"><span aria-hidden="true">←</span> Back to the sphere</Link>
        <p className="eyebrow">{project.id} / SELECTED WORK / {project.year}</p>
        <h1>{project.title}<span className="title-period">.</span></h1>
        <p className="detail-intro">{project.description}</p>
        <div className="project-meta">
          <div><span className="meta-label">MY ROLE</span><strong>{project.role}</strong></div>
          <div><span className="meta-label">BUILT WITH</span><div className="tag-list">{project.stack.map((item) => <span className="tag" key={item}>{item}</span>)}</div></div>
        </div>
      </motion.div>

      <motion.figure className="detail-hero-image" variants={reveal} initial="hidden" animate="show" transition={{ delay: 0.12 }}>
        <img src={project.thumbnail} alt={`Illustration representing ${project.title}`} />
        <figcaption>{project.title.toUpperCase()} — A WORK IN PROGRESS (FOR NOW)</figcaption>
      </motion.figure>

      <motion.section className="detail-content" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <div className="detail-section-title"><p className="eyebrow">THE GOOD STUFF</p><h2>Small details.<br />Big difference.</h2></div>
        <ul className="feature-list">
          {project.features.map((feature, index) => (
            <li key={feature}><span>0{index + 1}</span><p>{feature}</p><span aria-hidden="true">↗</span></li>
          ))}
        </ul>
      </motion.section>

      <motion.section className="gallery" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.16 }}>
        <div className="gallery-heading"><p className="eyebrow">A CLOSER LOOK</p><span>SCROLLING IS A FEATURE</span></div>
        <div className="gallery-grid">
          {project.images.map((image, index) => (
            <figure className={`gallery-image gallery-image-${index + 1}`} key={`${project.id}-${index}`}>
              <img src={image} alt={`${project.title} project view ${index + 1}`} loading="lazy" />
            </figure>
          ))}
        </div>
      </motion.section>

      <div className="project-links">
        <a className="button button-dark" href={project.liveUrl} target="_blank" rel="noreferrer">Visit the live site <span>↗</span></a>
        <a className="button button-outline" href={project.githubUrl} target="_blank" rel="noreferrer">Peek at the code <span>↗</span></a>
      </div>

      <Link to={`/project/${nextProject.slug}`} className="next-project">
        <span className="eyebrow">NEXT UP / {nextProject.id}</span>
        <span className="next-title">{nextProject.title}<span> ↗</span></span>
      </Link>
    </main>
  )
}
