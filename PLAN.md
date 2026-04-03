# Portfolio Website — Build Guide

Work through each step in order. Run `npm run dev` throughout so you can see changes live.

---

## Step 1 — `src/index.css` (global foundations)

Add these to your existing file. Don't replace anything already there.

**1a.** At the very top (before `@font-face`):
```css
html {
  scroll-behavior: smooth;
}
```

**1b.** On `#root`, change `text-align: center` → `text-align: left`

**1c.** At the bottom, add the animation classes:
```css
.reveal,
.reveal-left,
.reveal-right {
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: var(--delay, 0s);
}
.reveal        { opacity: 0; transform: translateY(40px); }
.reveal-left   { opacity: 0; transform: translateX(-60px); }
.reveal-right  { opacity: 0; transform: translateX(60px); }

.reveal.is-visible,
.reveal-left.is-visible,
.reveal-right.is-visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-left, .reveal-right {
    transition: none; opacity: 1; transform: none;
  }
}
```

**1d.** Add global utilities at the bottom:
```css
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-family: var(--sans);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.btn:hover    { opacity: 0.85; transform: translateY(-2px); }
.btn-primary  { background: var(--accent); color: #fff; }
.btn-outline  { background: transparent; border: 1px solid var(--accent); color: var(--accent); }

.section {
  padding: 6rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
.section-title {
  font-size: 2rem;
  font-family: var(--heading);
  color: var(--text-h);
  margin: 0 0 2.5rem;
}
.tag {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  background: var(--accent-bg);
  color: var(--accent);
  border: 1px solid var(--accent-border);
}
```

**Check:** site should look the same — no visible changes yet.

---

## Step 2 — `src/hooks/useScrollReveal.ts` (new file)

Create the folder `src/hooks/` and file `useScrollReveal.ts`:

```ts
import { useEffect, useRef } from 'react'

export function useScrollReveal<T extends HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px', ...options }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return ref
}
```

**How it works:** attach the returned `ref` to any element. When that element scrolls 15%
into view, the hook adds `.is-visible` — which triggers the CSS transitions from Step 1.
`rootMargin: '0px 0px -60px 0px'` triggers 60px before the element hits the bottom edge,
so animations feel snappy rather than late.

---

## Step 3 — Nav (`src/components/Nav/Nav.tsx` + `Nav.css`)

Create the folder and both files.

**Nav.tsx** — two separate `useEffect` hooks:

```tsx
import { useEffect, useState } from 'react'
import './Nav.css'

const NAV_LINKS = [
  { label: 'Home',       href: '#hero' },
  { label: 'About',      href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects',   href: '#projects' },
  { label: 'Contact',    href: '#contact' },
]

const SECTION_IDS = ['hero', 'about', 'experience', 'projects', 'contact']

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  // Transparent → solid on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Scroll spy — highlight active section
  useEffect(() => {
    const sections = SECTION_IDS
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) setActiveSection(visible[0].target.id)
      },
      { threshold: [0, 0.25, 0.5], rootMargin: '-20% 0px -20% 0px' }
    )

    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <a href="#hero" className="nav-logo">Peter.dev</a>
      <ul className="nav-links">
        {NAV_LINKS.map(link => (
          <li key={link.href}>
            <a
              href={link.href}
              className={`nav-link${activeSection === link.href.slice(1) ? ' nav-link--active' : ''}`}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

**Nav.css:**
```css
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}
.nav--scrolled {
  background: var(--bg);
  box-shadow: 0 1px 0 var(--border);
  backdrop-filter: blur(8px);
}
.nav-logo {
  font-family: var(--heading);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-h);
  text-decoration: none;
}
.nav-logo:hover { color: var(--accent); }
.nav-links {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  gap: 2rem;
}
.nav-link {
  position: relative;
  color: var(--text);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}
.nav-link:hover,
.nav-link--active { color: var(--accent); }
.nav-link--active::after {
  content: '';
  position: absolute;
  bottom: -4px; left: 0; right: 0;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
}

@media (max-width: 600px) {
  .nav { padding: 0.75rem 1rem; }
  .nav-links { gap: 1rem; }
  .nav-link { font-size: 0.8rem; }
}
```

**App.tsx** — add `<Nav />` (keep `<Header />` for now if you want, or remove it):
```tsx
import Nav from './components/Nav/Nav'
// ...
return (
  <>
    <Nav />
    <Header />
    <About />
  </>
)
```

**Check:** floating nav appears. Scrolling makes it go solid with a blur background.

---

## Step 4 — Hero (`src/components/Hero/Hero.tsx` + `Hero.css`)

**Hero.tsx:**
```tsx
import './Hero.css'

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-content">
        <p className="hero-eyebrow">Hi, I'm</p>
        <h1 className="hero-name">Peter Sheehan</h1>
        <p className="hero-title">Junior Frontend Developer</p>
        <p className="hero-tagline">I build clean, fast web experiences.</p>
        <div className="hero-actions">
          <a href="#projects" className="btn btn-primary">View My Work</a>
          <a href="#contact" className="btn btn-outline">Contact Me</a>
        </div>
      </div>
      <div className="hero-scroll-hint" aria-hidden="true">
        <span className="hero-scroll-arrow">↓</span>
      </div>
    </section>
  )
}
```

**Hero.css:**
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: none; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(8px); }
}

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6rem 2rem 4rem;
  box-sizing: border-box;
  position: relative;
}

.hero-content { max-width: 700px; }

/* Each element animates in on load with a staggered delay */
.hero-eyebrow,
.hero-name,
.hero-title,
.hero-tagline,
.hero-actions {
  opacity: 0;
  animation: fadeUp 0.6s ease forwards;
}

.hero-eyebrow { color: var(--accent); font-size: 1.1rem; animation-delay: 0.1s; }
.hero-name    { font-size: clamp(2.5rem, 6vw, 4rem); margin: 0.25rem 0 0.5rem; animation-delay: 0.3s; }
.hero-title   { color: var(--accent); font-size: 1.25rem; margin-bottom: 0.75rem; animation-delay: 0.5s; }
.hero-tagline { color: var(--text); font-size: 1.1rem; margin-bottom: 2rem; animation-delay: 0.65s; }
.hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; animation-delay: 0.8s; }

.hero-scroll-hint {
  position: absolute;
  bottom: 2rem; left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  animation: fadeUp 0.6s ease 1.2s forwards;
}
.hero-scroll-arrow {
  font-size: 1.5rem;
  color: var(--text);
  display: block;
  animation: bounce 1.5s ease-in-out 1.8s infinite;
}
```

**App.tsx** — add `<Hero />` and remove `<Header />`:
```tsx
import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import About from './components/About/about'

return (
  <>
    <Nav />
    <main>
      <Hero />
      <About />
    </main>
  </>
)
```

**Check:** full-screen hero with staggered text animation on load, bouncing scroll arrow.

---

## Step 5 — Rework About

**about.tsx** — add `useScrollReveal`, new layout:
```tsx
import { useScrollReveal } from '../../hooks/useScrollReveal'
import './about.css'

export default function About() {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <section id="about" className="section">
      <div ref={ref} className="about-inner reveal">
        <div className="about-text">
          <h2 className="section-title">About Me</h2>
          <p>
            I'm a junior frontend developer based in Ireland, passionate about
            building clean, accessible web experiences.
          </p>
          <p>
            I love turning designs into reality with HTML, CSS, and React.
            Always looking to learn something new.
          </p>
        </div>
        <div className="about-photo-wrapper">
          <img src="/image0 (1).jpeg" alt="Peter Sheehan" className="about-photo" />
        </div>
      </div>
    </section>
  )
}
```

**about.css** — replace entirely:
```css
.about-inner {
  display: flex;
  align-items: center;
  gap: 4rem;
}
.about-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.about-text p { line-height: 1.7; color: var(--text); }
.about-photo-wrapper { flex-shrink: 0; }
.about-photo {
  width: 280px; height: 280px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border);
  display: block;
}

@media (max-width: 768px) {
  .about-inner { flex-direction: column-reverse; gap: 2rem; align-items: center; text-align: center; }
  .about-photo { width: 200px; height: 200px; }
}
```

**Check:** scroll past the hero — About fades up into view.

---

## Step 6 — Timeline (`src/components/Timeline/`)

Create three files: `Timeline.tsx`, `TimelineCard.tsx`, `Timeline.css`.

**TimelineCard.tsx:**
```tsx
import { useScrollReveal } from '../../hooks/useScrollReveal'

export interface TimelineEntry {
  title: string
  company: string
  period: string
  description: string
  tags: string[]
  side: 'left' | 'right'
}

export default function TimelineCard({ entry }: { entry: TimelineEntry }) {
  const ref = useScrollReveal<HTMLDivElement>()
  const revealClass = entry.side === 'left' ? 'reveal-left' : 'reveal-right'

  return (
    <div ref={ref} className={`timeline-card timeline-card--${entry.side} ${revealClass}`}>
      <span className="timeline-period">{entry.period}</span>
      <h3 className="timeline-title">{entry.title}</h3>
      <p className="timeline-company">{entry.company}</p>
      <p className="timeline-description">{entry.description}</p>
      <div className="timeline-tags">
        {entry.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>
    </div>
  )
}
```

**Timeline.tsx:**
```tsx
import TimelineCard from './TimelineCard'
import type { TimelineEntry } from './TimelineCard'
import './Timeline.css'

const EXPERIENCE: TimelineEntry[] = [
  {
    side: 'left',
    title: 'Junior Frontend Developer',
    company: 'Acme Corp',
    period: 'Jan 2024 – Present',
    description: 'Built and maintained React component libraries. Improved page load performance by 30% through code splitting.',
    tags: ['React', 'TypeScript', 'Vite', 'CSS'],
  },
  {
    side: 'right',
    title: 'Frontend Intern',
    company: 'Tech Startup',
    period: 'Jun 2023 – Dec 2023',
    description: 'Developed responsive landing pages and internal dashboards. Integrated REST APIs and wrote unit tests with Jest.',
    tags: ['HTML', 'CSS', 'JavaScript', 'REST APIs'],
  },
  {
    side: 'left',
    title: 'Freelance Web Developer',
    company: 'Self-employed',
    period: '2022 – 2023',
    description: 'Designed and built websites for small businesses, handling everything from requirements gathering through deployment.',
    tags: ['HTML', 'CSS', 'JavaScript', 'WordPress'],
  },
]

export default function Timeline() {
  return (
    <section id="experience" className="section">
      <h2 className="section-title">Experience</h2>
      <div className="timeline">
        {EXPERIENCE.map((entry, i) => <TimelineCard key={i} entry={entry} />)}
      </div>
    </section>
  )
}
```

**Timeline.css:**
```css
.timeline {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem 0 2rem;
}

/* The vertical center line */
.timeline::before {
  content: '';
  position: absolute;
  left: 50%; top: 0; bottom: 0;
  width: 2px;
  background: var(--border);
  transform: translateX(-50%);
}

.timeline-card {
  position: relative;
  width: 44%;
  padding: 1.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow);
  margin-bottom: 3rem;
  box-sizing: border-box;
}

.timeline-card--left  { margin-right: auto; margin-left: 0; }
.timeline-card--right { margin-left: auto; margin-right: 0; }

/* The dot on the center line */
.timeline-card::before {
  content: '';
  position: absolute;
  top: 1.5rem;
  width: 14px; height: 14px;
  background: var(--accent);
  border: 3px solid var(--bg);
  border-radius: 50%;
  z-index: 1;
}
.timeline-card--left::before  { right: -36px; }
.timeline-card--right::before { left: -36px; }

/* Card typography */
.timeline-period      { display: block; font-size: 0.8rem; color: var(--accent); margin-bottom: 0.5rem; }
.timeline-title       { font-size: 1.1rem; font-weight: 600; color: var(--text-h); margin: 0 0 0.25rem; }
.timeline-company     { font-size: 0.9rem; color: var(--text); margin: 0 0 0.75rem; }
.timeline-description { font-size: 0.9rem; line-height: 1.6; color: var(--text); margin: 0 0 1rem; }
.timeline-tags        { display: flex; flex-wrap: wrap; gap: 0.4rem; }

/* Mobile — collapse to left rail */
@media (max-width: 768px) {
  .timeline::before { left: 16px; transform: none; }
  .timeline-card,
  .timeline-card--left,
  .timeline-card--right { width: calc(100% - 48px); margin-left: 40px; margin-right: 0; }
  .timeline-card--left::before,
  .timeline-card--right::before { left: -32px; right: auto; }
}
```

Add `<Timeline />` to `App.tsx`.

**Check:** scroll down — left cards slide in from the left, right cards from the right.

---

## Step 7 — Projects (`src/components/Projects/`)

Create `Projects.tsx`, `ProjectCard.tsx`, `Projects.css`.

**ProjectCard.tsx:**
```tsx
import { useScrollReveal } from '../../hooks/useScrollReveal'

export interface Project {
  title: string
  description: string
  tags: string[]
  repoUrl?: string
  liveUrl?: string
}

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useScrollReveal<HTMLElement>()

  return (
    <article
      ref={ref}
      className="project-card reveal"
      style={{ '--delay': `${index * 0.15}s` } as React.CSSProperties}
    >
      <h3 className="project-title">{project.title}</h3>
      <p className="project-description">{project.description}</p>
      <div className="project-tags">
        {project.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>
      <div className="project-links">
        {project.repoUrl && <a href={project.repoUrl} className="project-link" target="_blank" rel="noreferrer">GitHub ↗</a>}
        {project.liveUrl && <a href={project.liveUrl} className="project-link" target="_blank" rel="noreferrer">Live ↗</a>}
      </div>
    </article>
  )
}
```

**Projects.tsx:**
```tsx
import ProjectCard from './ProjectCard'
import type { Project } from './ProjectCard'
import './Projects.css'

const PROJECTS: Project[] = [
  {
    title: 'Personal Portfolio',
    description: 'This site — a single-page React + TypeScript portfolio with CSS scroll animations.',
    tags: ['React', 'TypeScript', 'Vite', 'CSS'],
    repoUrl: 'https://github.com/petersheehan/personal-website',
  },
  {
    title: 'Project Two',
    description: 'A brief description of what this project does and the tech involved.',
    tags: ['React', 'Node.js', 'REST API'],
  },
  {
    title: 'Project Three',
    description: 'Another project — what makes it interesting and what you learned.',
    tags: ['TypeScript', 'CSS Grid', 'IntersectionObserver'],
  },
]

export default function Projects() {
  return (
    <section id="projects" className="section">
      <h2 className="section-title">Projects</h2>
      <div className="projects-grid">
        {PROJECTS.map((project, i) => <ProjectCard key={project.title} project={project} index={i} />)}
      </div>
    </section>
  )
}
```

**Projects.css:**
```css
.projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

.project-card {
  display: flex; flex-direction: column; gap: 0.75rem;
  padding: 1.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.project-card:hover { transform: translateY(-4px); box-shadow: var(--shadow), 0 0 0 1px var(--accent-border); }

.project-title       { font-size: 1.1rem; font-weight: 600; color: var(--text-h); margin: 0; }
.project-description { font-size: 0.9rem; line-height: 1.6; color: var(--text); flex: 1; }
.project-tags        { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.project-links       { display: flex; gap: 1rem; }
.project-link        { font-size: 0.85rem; color: var(--accent); text-decoration: none; }
.project-link:hover  { opacity: 0.75; }

@media (max-width: 900px) { .projects-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .projects-grid { grid-template-columns: 1fr; } }
```

**Check:** three cards fade up with a stagger — each starts 0.15s after the last.

---

## Step 8 — Skills (`src/components/Skills/`)

Create `Skills.tsx` and `Skills.css`.

**Skills.tsx:**
```tsx
import { useScrollReveal } from '../../hooks/useScrollReveal'
import './Skills.css'

const SKILLS: Record<string, string[]> = {
  Frontend: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Vite'],
  Tools:    ['Git', 'GitHub', 'Figma', 'VS Code', 'Linux'],
  Other:    ['REST APIs', 'Responsive Design', 'Accessibility', 'Node.js'],
}

export default function Skills() {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <section className="section">
      <div ref={ref} className="skills-inner reveal">
        <h2 className="section-title">Skills &amp; Technologies</h2>
        <div className="skills-grid">
          {Object.entries(SKILLS).map(([category, items]) => (
            <div key={category} className="skill-category">
              <h3 className="skill-category-title">{category}</h3>
              <div className="skill-chips">
                {items.map(item => <span key={item} className="tag">{item}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Skills.css:**
```css
.skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
.skill-category-title { font-size: 1rem; font-weight: 600; color: var(--text-h); margin: 0 0 0.75rem; }
.skill-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }

@media (max-width: 768px) { .skills-grid { grid-template-columns: 1fr; gap: 1.5rem; } }
```

---

## Step 9 — Contact (`src/components/Contact/`)

Create `Contact.tsx` and `Contact.css`.

**Contact.tsx:**
```tsx
import { useScrollReveal } from '../../hooks/useScrollReveal'
import './Contact.css'

export default function Contact() {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <section id="contact" className="section contact-section">
      <div ref={ref} className="contact-inner reveal">
        <h2 className="section-title">Get In Touch</h2>
        <p className="contact-blurb">
          I'm open to new opportunities. Whether it's a question or just a hello,
          I'll do my best to get back to you.
        </p>
        <div className="contact-links">
          <a href="mailto:peter@example.com" className="contact-link">✉ Email Me</a>
          <a href="https://github.com/petersheehan" className="contact-link" target="_blank" rel="noreferrer">⌥ GitHub</a>
          <a href="https://linkedin.com/in/petersheehan" className="contact-link" target="_blank" rel="noreferrer">❏ LinkedIn</a>
        </div>
        <p className="contact-footer">Built with React + TypeScript + CSS animations</p>
      </div>
    </section>
  )
}
```

**Contact.css:**
```css
.contact-section { text-align: center; }
.contact-inner   { max-width: 600px; margin: 0 auto; }
.contact-blurb   { line-height: 1.7; color: var(--text); margin-bottom: 2rem; }
.contact-links   { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 3rem; }

.contact-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-h);
  text-decoration: none;
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.contact-link:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }
.contact-footer     { font-size: 0.8rem; color: var(--text); opacity: 0.6; }
```

---

## Step 10 — Wire up `App.tsx`

Replace everything in `App.tsx`:

```tsx
import './App.css'
import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import About from './components/About/about'
import Timeline from './components/Timeline/Timeline'
import Projects from './components/Projects/Projects'
import Skills from './components/Skills/Skills'
import Contact from './components/Contact/Contact'

function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Timeline />
        <Projects />
        <Skills />
        <Contact />
      </main>
    </>
  )
}

export default App
```

---

## Final check

```bash
npm run build   # must pass with zero TypeScript errors
npm run lint    # must pass ESLint
```

Then update placeholder content in `Timeline.tsx`, `Projects.tsx`, and `Contact.tsx` with your real info.
