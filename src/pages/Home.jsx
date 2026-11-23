import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProjectSphere from '../components/ProjectSphere'
import { projects } from '../data/projects'

export default function Home() {
  const navigate = useNavigate()
  const [entering, setEntering] = useState(null)
  const timer = useRef()

  const enterProject = (project, origin) => {
    if (entering) return
    const projectIndex = projects.findIndex((entry) => entry.id === project.id)
    const accent = projectIndex % 2 ? '#FFD60A' : '#FF2E93'
    const revealOrigin = origin || { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    setEntering({ project, accent, origin: revealOrigin })
    timer.current = window.setTimeout(() => {
      navigate(`/project/${project.slug}`, { state: { accent, origin: revealOrigin } })
    }, 620)
  }

  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <p className="eyebrow"><span className="status-dot" /> INDEPENDENT DESIGNER & DEVELOPER</p>
          <h1 id="home-title">Good work.<br />Slightly <span className="hand-underline">unexpected.</span></h1>
          <p className="hero-description">I turn ambitious ideas into useful, human things for the web. Usually with fewer meetings.</p>
          <p className="hero-nudge">Spin it. Click it. Hire me. <span aria-hidden="true">↘</span></p>
        </motion.div>

        <div className="sphere-stage">
          <div className="sphere-orbit orbit-one" aria-hidden="true" />
          <div className="sphere-orbit orbit-two" aria-hidden="true" />
          <ProjectSphere onSelect={enterProject} />
          <span className="orbit-note note-top" aria-hidden="true">8 IDEAS, ONE SPHERE</span>
          <span className="orbit-note note-bottom" aria-hidden="true">DRAG TO EXPLORE ↗</span>
        </div>
        <p className="home-footnote">A small collection of things I made with curiosity and an unreasonable number of browser tabs.</p>
      </section>
      {entering && (
        <motion.div
          className="project-reveal"
          initial={{ clipPath: `circle(0px at ${entering.origin.x}px ${entering.origin.y}px)` }}
          animate={{ clipPath: `circle(150% at ${entering.origin.x}px ${entering.origin.y}px)` }}
          transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
          style={{ backgroundColor: entering.accent }}
          aria-hidden="true"
        />
      )}
    </main>
  )
}
