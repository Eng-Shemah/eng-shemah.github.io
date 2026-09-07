# Gwiza Robert SHEMA — Portfolio

Personal portfolio site: about, skills, experience, education, projects, and a
downloadable CV. Built for the Web Technology course portfolio assignment.

## Stack

Plain HTML, CSS, and JavaScript — no build step, no dependencies. Deploys as
static files anywhere (GitHub Pages, Netlify, Vercel).

## Structure

```
index.html        Page content
css/style.css      Styling (light/dark theme via CSS variables)
js/main.js         Theme toggle, mobile nav, scroll animations
assets/            CV PDF
```

## Running locally

Open `index.html` directly, or serve it:

```bash
python -m http.server 5500
```

Then visit http://localhost:5500.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repo.
2. Repo Settings → Pages → Source: deploy from the `main` branch, `/ (root)`.
3. The site publishes at `https://<username>.github.io/<repo>/`.
