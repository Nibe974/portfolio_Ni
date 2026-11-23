import { motion } from 'framer-motion'

const skills = [
  { title: 'The thinking', items: ['Product strategy', 'UX research', 'Information architecture', 'Prototyping'] },
  { title: 'The making', items: ['Interface design', 'Design systems', 'Creative development', 'Motion & interaction'] },
  { title: 'The toolkit', items: ['React', 'JavaScript', 'Three.js', 'Figma'] },
]

export default function About() {
  return (
    <main className="about-page page-shell">
      <motion.div className="about-intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow"><span className="status-dot" /> A LITTLE ABOUT ME</p>
        <h1>Curious by nature.<br /><span>Particular about pixels.</span></h1>
        <p className="about-lede">I’m Ni, an independent designer and developer who likes making digital things feel a little more human. I move between strategy, design and code—because the interesting bits usually happen in between.</p>
      </motion.div>

      <motion.section className="about-photo-section" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="about-photo" role="img" aria-label="Abstract portrait illustration made from layered geometric shapes">
          <div className="portrait-shape shape-back" />
          <div className="portrait-shape shape-body" />
          <div className="portrait-face"><span /><span /><i /></div>
          <span className="photo-sticker">probably<br />overthinking<br />this ↗</span>
        </div>
        <div className="photo-caption"><span>01 — HUMAN PERSON</span><span>NOT A STOCK PHOTO. NOT YET A PHOTO.</span></div>
      </motion.section>

      <section className="fun-fact">
        <p className="eyebrow">A FUN FACT, BECAUSE THIS IS THE SECTION FOR IT</p>
        <p>I collect ideas like browser tabs. The good news is, I eventually close a few.</p>
        <span className="fact-doodle" aria-hidden="true">✳</span>
      </section>

      <section className="skills-section">
        <div><p className="eyebrow">WHAT I BRING TO THE TABLe</p><h2>Range is<br />the point.</h2></div>
        <div className="skills-list">
          {skills.map((group) => (
            <div className="skill-group" key={group.title}>
              <h3>{group.title}</h3>
              <ul>{group.items.map((skill) => <li key={skill}>{skill}<span>↗</span></li>)}</ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
