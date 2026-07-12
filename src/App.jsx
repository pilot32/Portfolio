import React, { useEffect, useState, useRef, useCallback } from 'react'

/* ───────────────────────── Custom Cursor ───────────────────────── */
function CustomCursor() {
  useEffect(() => {
    const dot = document.querySelector('.cursor-dot')
    const ring = document.querySelector('.cursor-ring')
    if (!dot || !ring) return

    let mouseX = 0
    let mouseY = 0
    let ringX = 0
    let ringY = 0
    const lerp = 0.15

    const onMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`
    }

    const animate = () => {
      ringX += (mouseX - ringX) * lerp
      ringY += (mouseY - ringY) * lerp
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`
      requestAnimationFrame(animate)
    }

    const hoverSelector = 'a, button, .btn-dark, .btn-ghost, .nav-cta, .skill-pill, .ach-card'

    const onOver = (e) => {
      if (e.target.closest(hoverSelector)) {
        dot.classList.add('hovered')
        ring.classList.add('hovered')
      }
    }
    const onOut = (e) => {
      if (e.target.closest(hoverSelector)) {
        dot.classList.remove('hovered')
        ring.classList.remove('hovered')
      }
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    const raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" />
      <div className="cursor-ring" />
    </>
  )
}

/* ──────────────────── Animated Stat Counter ────────────────────── */
function AnimatedStat({ target, suffix = '', decimal = false, label }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 1500
          const start = performance.now()

          const step = (now) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // ease-out quad
            const eased = 1 - (1 - progress) * (1 - progress)

            if (decimal) {
              setDisplay(parseFloat((eased * target).toFixed(2)))
            } else {
              setDisplay(Math.round(eased * target))
            }

            if (progress < 1) {
              requestAnimationFrame(step)
            }
          }

          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [target, decimal])

  return (
    <div className="hero-stat" ref={ref}>
      <div className="stat-num">
        {decimal ? display.toFixed(2) : display}
        {suffix}
      </div>
      <div className="stat-desc">{label}</div>
    </div>
  )
}

/* ───────────────────── Footer Typing Effect ────────────────────── */
function FooterTyping() {
  const [showIcon, setShowIcon] = useState(false)
  const [visible, setVisible] = useState('')
  const [secondText, setSecondText] = useState('')
  const ref = useRef(null)
  const hasTyped = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTyped.current) {
          hasTyped.current = true
          const firstPart = 'Built with '
          const secondPart = ' and React'
          let i = 0
          const tickFirst = () => {
            i++
            setVisible(firstPart.slice(0, i))
            if (i < firstPart.length) {
              setTimeout(tickFirst, 50)
            } else {
              setShowIcon(true)
              let j = 0
              const tickSecond = () => {
                j++
                setSecondText(secondPart.slice(0, j))
                if (j < secondPart.length) {
                  setTimeout(tickSecond, 50)
                }
              }
              setTimeout(tickSecond, 200)
            }
          }
          tickFirst()
        }
      },
      { threshold: 0.3 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <span className="footer-typing" ref={ref} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span>{visible}</span>
      {showIcon && (
        <svg style={{ color: 'var(--accent)', margin: '0 4px', display: 'inline-block', verticalAlign: 'middle' }} width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      )}
      <span>{secondText}</span>
      <span className="typing-cursor">|</span>
    </span>
  )
}

/* ══════════════════════════ MAIN APP ═══════════════════════════ */
function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const [activeSection, setActiveSection] = useState('about')
  const scrollBarRef = useRef(null)

  /* ── Magnetic button handler ── */
  const handleMagnetic = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    e.currentTarget.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`
  }, [])

  const resetMagnetic = useCallback((e) => {
    e.currentTarget.style.transform = 'translate(0,0)'
  }, [])

  useEffect(() => {
    /* ── Reveal animations (multiple classes) ── */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('shown')
          }
        })
      },
      { threshold: 0.08 }
    )

    document
      .querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
      .forEach((el) => io.observe(el))

    /* ── Scroll progress bar + active nav ── */
    const handleScroll = () => {
      // active section
      const sections = document.querySelectorAll('section[id]')
      let cur = ''
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 100) {
          cur = s.id
        }
      })
      if (cur) setActiveSection(cur)

      // scroll progress
      if (scrollBarRef.current) {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = docHeight > 0 ? scrollTop / docHeight : 0
        scrollBarRef.current.style.transform = `scaleX(${progress})`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      {/* BACKGROUND BACKDROP */}
      <div className="bg-backdrop" />

      {/* CUSTOM CURSOR */}
      <CustomCursor />

      {/* Floating gradient blobs */}
      <div className="blob-container">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* SCROLL PROGRESS */}
      <div className="scroll-progress" ref={scrollBarRef} />

      {/* NAV */}
      <nav>
        <a href="#hero" className="nav-brand">
          <div className="nav-avatar">AO</div>
          <div className="nav-brand-text">
            <span className="nav-brand-name">Akshat Ojha</span>
            <span className="nav-brand-role">Software Engineer</span>
          </div>
        </a>
        <ul className="nav-links">
          <li>
            <a href="#about" className={activeSection === 'about' ? 'active' : ''}>
              <span className="num">01</span> About
            </a>
          </li>
          <li>
            <a href="#experience" className={activeSection === 'experience' ? 'active' : ''}>
              <span className="num">02</span> Experience
            </a>
          </li>
          <li>
            <a href="#projects" className={activeSection === 'projects' ? 'active' : ''}>
              <span className="num">03</span> Projects
            </a>
          </li>
          <li>
            <a href="#skills" className={activeSection === 'skills' ? 'active' : ''}>
              <span className="num">04</span> Skills
            </a>
          </li>
          <li>
            <a href="#contact" className={activeSection === 'contact' ? 'active' : ''}>
              <span className="num">05</span> Contact
            </a>
          </li>
        </ul>
        <div className="nav-actions">
          <span className="magnetic-wrap" onMouseMove={handleMagnetic} onMouseLeave={resetMagnetic}>
            <a href="mailto:ojhaakshat429@gmail.com" className="nav-cta">
            Get in touch
            <svg className="arrow-up-right-svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </a>
          </span>
          <span className="magnetic-wrap" onMouseMove={handleMagnetic} onMouseLeave={resetMagnetic}>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg className="sun-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg className="moon-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>
          </span>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section id="hero">
          <div className="hero-status">
            <span className="hero-dot" />
            Open to R&amp;D / SDE roles — 2027
          </div>

          <div className="hero-body">
            <div className="hero-left">
              <h1 className="hero-name">
                {'Akshat'.split('').map((char, i) => (
                  <span key={i} className="hero-name-char" style={{ animationDelay: `${i * 0.05}s` }}>
                    {char}
                  </span>
                ))}
                <br />
                <span className="last">
                  {'Ojha.'.split('').map((char, i) => (
                    <span key={i} className="hero-name-char" style={{ animationDelay: `${(i + 6) * 0.05}s` }}>
                      {char}
                    </span>
                  ))}
                </span>
              </h1>
              <p className="hero-tagline hero-fade-up" style={{ animationDelay: '0.6s' }}>
                Building web &amp; mobile systems that scale — from REST APIs to distributed microservices.
              </p>
              <div className="hero-btns hero-fade-up" style={{ animationDelay: '0.8s' }}>
                <span className="magnetic-wrap" onMouseMove={handleMagnetic} onMouseLeave={resetMagnetic}>
                  <a href="#projects" className="btn-dark">
                    See selected work
                    <svg className="arrow-down-svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <polyline points="19 12 12 19 5 12"></polyline>
                    </svg>
                  </a>
                </span>
                <span className="magnetic-wrap" onMouseMove={handleMagnetic} onMouseLeave={resetMagnetic}>
                  <a href="https://github.com/pilot32" target="_blank" rel="noreferrer" className="btn-ghost">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    GitHub
                  </a>
                </span>
                <span className="magnetic-wrap" onMouseMove={handleMagnetic} onMouseLeave={resetMagnetic}>
                  <a href="mailto:ojhaakshat429@gmail.com" className="btn-ghost">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    Email
                  </a>
                </span>
              </div>
            </div>

            <div className="hero-stats">
              <AnimatedStat target={8.95} decimal label="CGPA" />
              <AnimatedStat target={3} label="Internships" />
              <AnimatedStat target={3} label="Shipped Projects" />
              <AnimatedStat target={6} suffix="th" label="College Codeforces" />
              <div className="hero-location">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Bhubaneswar, India
              </div>
            </div>
          </div>

          <div className="marquee-wrap">
            <div className="marquee-track">
              <span className="marquee-item">REST APIs</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Distributed Design</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Database Tuning</span><span className="marquee-dot">•</span>
              <span className="marquee-item">React &amp; Flutter</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Backend Systems</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Microservices</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Dart &amp; Flutter</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Native Android • XML • YAML</span><span className="marquee-dot">•</span>
              <span className="marquee-item">REST APIs</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Distributed Design</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Database Tuning</span><span className="marquee-dot">•</span>
              <span className="marquee-item">React &amp; Flutter</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Backend Systems</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Microservices</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Dart &amp; Flutter</span><span className="marquee-dot">•</span>
              <span className="marquee-item">Native Android • XML • YAML</span><span className="marquee-dot">•</span>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about">
          <div className="wrap reveal-left">
            <div className="section-rule">
              <span className="rule-num">01</span>
              <span className="rule-label">About — The Short Version</span>
            </div>
            <div className="about-grid">
              <div className="about-body">
                <h2 className="about-heading">I build backends with the same care most people reserve for their frontends.</h2>
                <p>I'm a Computer Science undergraduate at KIIT with hands-on experience building web and mobile applications. My focus is on backend systems, REST APIs, and database design — and I've shipped production-grade solutions inside cross-functional Agile teams.</p>
                <p>I'm drawn to problems that sit at the intersection of large-scale document management, data-intensive systems, and clean engineering. Whether it's taming PostgreSQL queries with Redis caching or architecting microservices on AWS, I enjoy the craft of making things fast, reliable, and maintainable.</p>
              </div>
              <div className="about-sidebar">
                <p className="edu-label">Education</p>
                <div className="edu-item">
                  <div className="edu-row">
                    <span className="edu-degree">B.Tech, Computer Science</span>
                    <span className="edu-year">2023 — 2027</span>
                  </div>
                  <div className="edu-school">KIIT — Kalinga Institute of Industrial Technology</div>
                  <div className="edu-score">CGPA 8.95</div>
                </div>
                <div className="edu-item">
                  <div className="edu-row">
                    <span className="edu-degree">Senior Secondary (Class XII)</span>
                    <span className="edu-year">2022</span>
                  </div>
                  <div className="edu-school">Shri Pragya Public School</div>
                  <div className="edu-score">82%</div>
                </div>
                <div className="edu-item">
                  <div className="edu-row">
                    <span className="edu-degree">Secondary (Class X)</span>
                    <span className="edu-year">2020</span>
                  </div>
                  <div className="edu-school">Shri Pragya Public School</div>
                  <div className="edu-score">87.17%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience">
          <div className="wrap reveal-right">
            <div className="section-rule">
              <span className="rule-num">02</span>
              <span className="rule-label">Experience — Where I've Shipped</span>
            </div>

            <div className="exp-item">
              <div className="exp-meta">
                <div className="exp-year-label">2026</div>
                <div className="exp-num">01</div>
              </div>
              <div>
                <h3 className="exp-role">Software Developer Intern (Remote)</h3>
                <div className="exp-company"><strong>Shoolin Consultancy</strong></div>
                <ul className="exp-points">
                  <li><span className="li-num">01</span> Developed 10+ RESTful APIs for an e-commerce backend using Node.js, Express.js, and MongoDB following a modular architecture.</li>
                  <li><span className="li-num">02</span> Implemented authentication, CRUD operations, request validation to support core platform features.</li>
                  <li><span className="li-num">03</span> Collaborated with the frontend team, tested APIs using Postman, and maintained clean, well-documented backend code using Git.</li>
                </ul>
                <div className="exp-tags">
                  <span className="exp-tag">NODE.JS</span>
                  <span className="exp-tag">EXPRESS.JS</span>
                  <span className="exp-tag">MONGODB</span>
                  <span className="exp-tag">REST APIS</span>
                  <span className="exp-tag">GIT</span>
                  <span className="exp-tag">POSTMAN</span>
                </div>
              </div>
              <div className="exp-link-col">
              </div>
            </div>

            <div className="exp-item">
              <div className="exp-meta">
                <div className="exp-year-label">2026</div>
                <div className="exp-num">02</div>
              </div>
              <div>
                <h3 className="exp-role">Software Developer Intern (Remote)</h3>
                <div className="exp-company"><strong>Exergy Solutions</strong> — Haryana Govt.</div>
                <ul className="exp-points">
                  <li><span className="li-num">01</span> Built reusable React and JavaScript components for a government-scale digital platform, improving maintainability and long-term scalability.</li>
                  <li><span className="li-num">02</span> Diagnosed and resolved UI rendering bottlenecks through structured root-cause analysis, improving application performance and reliability.</li>
                  <li><span className="li-num">03</span> Collaborated within Agile/Scrum workflows, participated in code reviews, and maintained accurate technical documentation per team standards.</li>
                  <li><span className="li-num">04</span> Created the data payload for REST APIs to connect frontend interfaces with backend services, ensuring data consistency across the platform.</li>
                </ul>
                <div className="exp-tags">
                  <span className="exp-tag">REACT</span>
                  <span className="exp-tag">JAVASCRIPT</span>
                  <span className="exp-tag">REST APIS</span>
                  <span className="exp-tag">AGILE</span>
                </div>
              </div>
              <div className="exp-link-col">
                 <a href="https://cleanmobility.haryanatransport.gov.in/" target="_blank" rel="noreferrer" className="exp-ext-link">
                  cleanmobility.haryanatransport.gov.in
                  <svg className="arrow-up-right-svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              </div>
            </div>

            <div className="exp-item">
              <div className="exp-meta">
                <div className="exp-year-label">2025</div>
                <div className="exp-num">03</div>
              </div>
              <div>
                <h3 className="exp-role">Flutter Developer Intern</h3>
                <div className="exp-company"><strong>Exsolvia</strong> — Pre-Stage Startup</div>
                <ul className="exp-points">
                  <li><span className="li-num">01</span> Designed and developed a Mobile application for School for Management of students. Including various and daily task of student activities.</li>
                  <li><span className="li-num">02</span> Led on-campus deployment efforts, coordinating cross-functional stakeholders and delivering project outcomes on schedule.</li>
                  <li><span className="li-num">03</span> Maintained detailed technical documentation throughout development and deployment phases.</li>
                </ul>
                <div className="exp-tags">
                  <span className="exp-tag">FLUTTER</span>
                  <span className="exp-tag">DART</span>
                  <span className="exp-tag">REST APIS</span>
                  <span className="exp-tag">FIREBASE</span>
                </div>
              </div>
              <div className="exp-link-col">
                 <a href="https://kampyn.com/" target="_blank" rel="noreferrer" className="exp-ext-link">
                  kampyn.com
                  <svg className="arrow-up-right-svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects">
          <div className="wrap reveal">
            <div className="section-rule">
              <span className="rule-num">03</span>
              <span className="rule-label">Selected Projects</span>
            </div>

            <div className="projects-head">
              <h2 className="projects-heading">A small set of things I've<br />actually put into the world.</h2>
              <a href="https://github.com/pilot32" target="_blank" rel="noreferrer" className="github-link">
                More on GitHub
                <svg className="arrow-up-right-svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </a>
            </div>

            <div className="proj-item">
              <div className="proj-num">01</div>
              <div>
                <h3 className="proj-name">Crop Advisory Application</h3>
                <div className="proj-subtitle">AI Disease Detection • Mobile-First</div>
              </div>
              <div>
                <p className="proj-desc">Integrated an AI-based disease detection engine Machine Learning Models into Mobile, bridging ML models with a production ready interface.</p>
                <ul className="proj-bullets">
                  <li>Bridged ML models with production-ready mobile interface</li>
                  <li>Demonstrated rapid learning and application of new technology stacks</li>
                </ul>
                <div className="proj-tags" style={{ marginTop: '12px' }}>
                  <span className="proj-tag">FLUTTER</span>
                  <span className="proj-tag">SUPABASE</span>
                  <span className="proj-tag">REST</span>
                  <span className="proj-tag">PYTHON</span>
                  <span className="proj-tag">AI/ML</span>
                </div>
              </div>
              <div className="proj-meta">
                <div className="proj-year">2025</div>
                 <a href="https://github.com/pilot32/Crop_Advisory" target="_blank" rel="noreferrer" className="proj-cat">
                  Applied ML
                  <svg className="arrow-up-right-svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
                <a href="https://github.com/pilot32/Crop_Advisory" target="_blank" rel="noreferrer" className="proj-gh">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  PILOT32
                </a>
              </div>
            </div>

            <div className="proj-item">
              <div className="proj-num">02</div>
              <div>
                <h3 className="proj-name">Price Scrapper System</h3>
                <div className="proj-subtitle">Scheduled Scraping • Notification Pipeline</div>
              </div>
              <div>
                <p className="proj-desc">An automated price-monitoring backend with scheduled scraping workflows and structured REST endpoints for data ingestion and notification triggers. Relational models are indexed for high-frequency reads and writes.</p>
                <ul className="proj-bullets">
                  <li>Scheduled scraper workers</li>
                  <li>Indexed relational models</li>
                  <li>Notification trigger endpoints</li>
                </ul>
                <div className="proj-tags" style={{ marginTop: '12px' }}>
                  <span className="proj-tag">NODE.JS</span>
                  <span className="proj-tag">FLUTTER</span>
                  <span className="proj-tag">REST</span>
                  <span className="proj-tag">SQL</span>
                </div>
              </div>
              <div className="proj-meta">
                <div className="proj-year">2024</div>
                 <a href="https://github.com/pilot32/Price_scrapper-flutter-" target="_blank" rel="noreferrer" className="proj-cat">
                  Automation
                  <svg className="arrow-up-right-svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
                <a href="https://github.com/pilot32/Price_scrapper-flutter-" target="_blank" rel="noreferrer" className="proj-gh">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  PILOT32
                </a>
              </div>
            </div>

            <div className="proj-item">
              <div className="proj-num">03</div>
              <div>
                <h3 className="proj-name">Video Streaming Platform</h3>
                <div className="proj-subtitle">Distributed Microservices • High-Concurrency Delivery</div>
              </div>
              <div>
                <p className="proj-desc">Developed a full-stack distributed system using FastAPI, Docker, and AWS with microservices architecture designed for high-throughput and low-latency video delivery.</p>
                <ul className="proj-bullets">
                  <li>Developed full-stack distributed system using microservices architecture</li>
                  <li>Implemented caching and optimized PostgreSQL queries to reduce response times</li>
                  <li>Designed RESTful APIs with clean interface contracts</li>
                </ul>
                <div className="proj-tags" style={{ marginTop: '12px' }}>
                  <span className="proj-tag">FLUTTER</span>
                  <span className="proj-tag">FASTAPI</span>
                  <span className="proj-tag">AWS</span>
                  <span className="proj-tag">DOCKER</span>
                  <span className="proj-tag">POSTGRESQL</span>
                </div>
              </div>
              <div className="proj-meta">
                <div className="proj-year">Ongoing</div>
                 <a href="https://github.com/pilot32" target="_blank" rel="noreferrer" className="proj-cat">
                  Backend Systems
                  <svg className="arrow-up-right-svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
                <a href="https://github.com/pilot32" target="_blank" rel="noreferrer" className="proj-gh">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  PILOT32
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills">
          <div className="wrap reveal-scale">
            <div className="section-rule">
              <span className="rule-num">04</span>
              <span className="rule-label">Skills — What I Reach For</span>
            </div>

            <div className="skills-layout">
              <div>
                <h2 className="skills-intro-head">Tools I know well enough to reach for without thinking.</h2>
                <p className="skills-intro-body">Highlighted items are what I use most. Everything else I've shipped real work with.</p>
              </div>
              <div className="skills-cats">
                <div>
                  <p className="skill-group-label">Languages</p>
                  <div className="skill-pills">
                    <span className="skill-pill featured">JavaScript</span>
                    <span className="skill-pill featured">Dart</span>
                    <span className="skill-pill">Java</span>
                    <span className="skill-pill">Python</span>
                    <span className="skill-pill">SQL</span>
                    <span className="skill-pill">C</span>
                    <span className="skill-pill">XML</span>
                    <span className="skill-pill">YAML</span>
                  </div>
                </div>
                <div>
                  <p className="skill-group-label">Frameworks</p>
                  <div className="skill-pills">
                    <span className="skill-pill featured">React JS</span>
                    <span className="skill-pill featured">Node.js</span>
                    <span className="skill-pill">Express.js</span>
                    <span className="skill-pill">FastAPI</span>
                    <span className="skill-pill">Flutter</span>
                    <span className="skill-pill">Native Android Development</span>
                  </div>
                </div>
                <div>
                  <p className="skill-group-label">Databases</p>
                  <div className="skill-pills">
                    <span className="skill-pill featured">PostgreSQL</span>
                    <span className="skill-pill featured">Supabase</span>
                    <span className="skill-pill">MongoDB</span>
                    <span className="skill-pill">Firebase</span>
                    <span className="skill-pill">Redis</span>
                    <span className="skill-pill">MySQL</span>
                  </div>
                </div>
                <div>
                  <p className="skill-group-label">DevOps &amp; Tools</p>
                  <div className="skill-pills">
                    <span className="skill-pill featured">Git</span>
                    <span className="skill-pill">GitHub</span>
                    <span className="skill-pill">Docker</span>
                    <span className="skill-pill">AWS</span>
                    <span className="skill-pill">WebScraping</span>
                    <span className="skill-pill">Postman</span>
                  </div>
                </div>
                <div>
                  <p className="skill-group-label">Core Concepts</p>
                  <div className="skill-pills">
                    <span className="skill-pill">Data Structures</span>
                    <span className="skill-pill">OOP</span>
                    <span className="skill-pill">System Design</span>
                    <span className="skill-pill">REST APIs</span>
                    <span className="skill-pill">Microservices</span>
                    <span className="skill-pill">Operating Systems</span>
                    <span className="skill-pill">Networking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACHIEVEMENTS */}
        <section id="achievements">
          <div className="wrap reveal-left">
            <div className="section-rule">
              <span className="rule-num">04.5</span>
              <span className="rule-label">Recognition</span>
            </div>
            <div className="ach-grid">
              <div className="ach-card">
                <div className="ach-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                    <path d="M4 22h16"></path>
                    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
                    <path d="M12 2a6 6 0 0 1 6 6v3.5c0 3-2.5 5.5-6 5.5s-6-2.5-6-5.5V8a6 6 0 0 1 6-6z"></path>
                  </svg>
                </div>
                <div>
                  <div className="ach-title">Smart India Hackathon 2025 — Nominee</div>
                  <div className="ach-sub">Selected among top college teams to represent the institution in the national-level engineering problem-solving challenge.</div>
                </div>
              </div>
              <div className="ach-card">
                <div className="ach-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="2" y1="20" x2="22" y2="20"></line>
                    <line x1="12" y1="17" x2="12" y2="20"></line>
                  </svg>
                </div>
                <div>
                  <div className="ach-title">Ranked 6th — College Codeforces Contest</div>
                  <div className="ach-sub">Top 10 finish in a competitive programming contest — demonstrating algorithmic depth and attention to technical detail.</div>
                </div>
              </div>
              <div className="ach-card">
                <div className="ach-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5L18 5l-9 9-4.5 2.5z"></path>
                    <path d="M12 12l9-9-9 9z"></path>
                    <path d="M18.5 5.5L15 9"></path>
                  </svg>
                </div>
                <div>
                  <div className="ach-title">Hackathon Participation</div>
                  <div className="ach-sub">Participated in multiple hackathons, collaborating in fast-paced teams to build practical solutions under tight timelines.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact">
          <div className="wrap reveal-right">
            <div className="section-rule">
              <span className="rule-num">05</span>
              <span className="rule-label">Let's Talk</span>
            </div>

            <div className="contact-layout">
              <div>
                <h2 className="contact-heading">Have a problem worth solving?<br /><span className="italic">Let's build it.</span></h2>
                <p className="contact-body">I'm currently open to R&amp;D, SDE, and backend-leaning internships. Drop a note — I read every message.</p>
                <div className="contact-direct">
                  <a href="mailto:ojhaakshat429@gmail.com" className="contact-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    ojhaakshat429@gmail.com
                  </a>
                  <a href="https://github.com/pilot32" target="_blank" rel="noreferrer" className="contact-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    github.com/pilot32
                  </a>
                  <a href="tel:+917339900712" className="contact-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.68h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.6v-.68z" />
                    </svg>
                    +91 73399 00712
                  </a>
                </div>
              </div>

              <div className="form-card">
                <div className="form-label">Quick Message — Mock Form</div>
                <div className="form-field">
                  <label>Your Name</label>
                  <input type="text" placeholder="Ada Lovelace" />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" placeholder="you@company.com" />
                </div>
                <div className="form-field">
                  <label>Message</label>
                  <textarea placeholder="Tell me about the problem you're solving..."></textarea>
                </div>
                <button className="form-submit">Send Message →</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span className="footer-copy">© 2025 Akshat Ojha</span>
        <span className="footer-copy">Bhubaneswar, India</span>
        <FooterTyping />
      </footer>
    </>
  )
}

export default App
