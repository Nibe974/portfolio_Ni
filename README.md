# Ni — portfolio

A playful, responsive portfolio built with React, Vite, React Three Fiber, Drei, Three.js, Framer Motion and React Router.

## Get started

```bash
npm install
npm run dev
```

Create a production build with `npm run build`, or preview one with `npm run preview`.

## Deploy to GitHub Pages

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. Push to `main`, then in the repository settings choose **Pages → Build and deployment → Source → GitHub Actions**. The workflow builds the site and publishes `dist/` automatically. The site URL is `https://nibe974.github.io/portfolio_Ni/`.

The Pages build sets the Vite base path for this repository and uses hash-based routes, so direct navigation and refreshes work without a custom 404 redirect.

## Projects

Edit the eight entries in `src/data/projects.js`. Each entry includes an `id`, `slug`, `title`, `description`, `thumbnail`, `images`, `liveUrl`, `githubUrl`, `role`, `year`, `stack`, and `features`. Replace the placeholder links, copy and generated SVG illustrations with your project details.

The reusable project page lives in `src/pages/ProjectDetail.jsx`; the interactive sphere and its screen-reader/keyboard project list are in `src/components/ProjectSphere.jsx`.

## Personalize

- Update the display name and social/email placeholders in `src/components/Navbar.jsx` and `src/pages/Contact.jsx`.
- The white/black/pink/yellow design tokens and responsive layout are in `src/styles/global.css`.
- The cursor trail uses a small WebGL feedback shader. It automatically turns itself off for touch devices and reduced-motion preferences.
- If WebGL is unavailable, the home page shows a friendly fallback and keeps the full project list available to keyboard and assistive-technology users.

Replace `hello@example.com` and the generic social URLs before publishing. The contact form opens the visitor’s email app; it does not send data to a server.
