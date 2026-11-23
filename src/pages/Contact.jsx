import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const subject = encodeURIComponent(`Hello from ${form.get('name')}`)
    const body = encodeURIComponent(`${form.get('message')}\n\nFrom: ${form.get('name')} (${form.get('email')})`)
    window.location.href = `mailto:hello@example.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <main className="contact-page page-shell">
      <motion.div className="contact-intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow"><span className="status-dot" /> THE GOOD PART STARTS HERE</p>
        <h1>Got a good<br />one? <span>Let’s talk.</span></h1>
        <p>Have a project, a question, or a particularly good snack recommendation? My inbox is open.</p>
      </motion.div>
      <div className="contact-layout">
        <motion.form className="contact-form" onSubmit={handleSubmit} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <label htmlFor="name">YOUR NAME<input id="name" name="name" autoComplete="name" placeholder="What should I call you?" required /></label>
          <label htmlFor="email">YOUR EMAIL<input id="email" name="email" type="email" autoComplete="email" placeholder="Where can I write back?" required /></label>
          <label htmlFor="message">THE INTERESTING BIT<textarea id="message" name="message" rows="4" placeholder="A little context goes a long way…" required /></label>
          <button className="button button-dark submit-button" type="submit">{submitted ? 'Your email app should be open' : 'Send a note'} <span>↗</span></button>
          {submitted && <p className="form-note" role="status">If nothing happened, email me at hello@example.com.</p>}
        </motion.form>
        <aside className="contact-aside">
          <div className="availability-note"><span className="availability-dot" /> AVAILABLE FOR SELECT PROJECTS <span className="aside-sparkle">✳</span></div>
          <p className="aside-label">OR FIND ME AROUND THE INTERNET</p>
          <div className="social-links">
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>
            <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
            <a href="mailto:hello@example.com">Email <span>↗</span></a>
          </div>
          <p className="contact-time">Usually replies within a couple of working days.<br />Occasionally while making tea.</p>
        </aside>
      </div>
    </main>
  )
}
