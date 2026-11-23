import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="site-header">
      <Link to="/" className="wordmark" aria-label="Ni home">
        ni<span>.</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
    </header>
  )
}
