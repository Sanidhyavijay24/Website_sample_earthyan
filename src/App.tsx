/**
 * @file App.tsx
 * @description Main landing page application layout. Integrates the 3D PlantScene with a custom scroll-bound animation.
 * @module src
 */

import { useState, useEffect, type PointerEvent, type CSSProperties } from 'react'
import PlantScene from './components/PlantScene'
import { useSectionScrollRanges } from './hooks/useSectionScrollRanges'

// Color tokens matching the Forest Green & Gold design system (Warm Sandstone Option A variant)
const c = {
  deep: '#121613',       // Deep forest-charcoal (primary headers)
  mid: '#1B211C',        // Medium charcoal-olive (subheadings)
  warm: '#F5F1E6',       // Frosted card base background
  warmer: '#FAF8F3',     // Frosted card hover background
  gold: '#9C7A3C',       // Deeper antique gold (high contrast on light bg)
  goldDark: '#7C5F2C',   // Even darker gold for links
  cream: '#121613',      // Inverted for default body text color (dark charcoal)
  creamWarm: '#1B211C',  // Inverted for secondary highlights
  muted: '#525F56',      // Dark slate olive-grey for body paragraphs
  dim: '#76857C',        // Slate-grey for labels and tags
  border: 'rgba(23, 27, 24, 0.12)', // Thin, delicate dark border
  borderSoft: 'rgba(23, 27, 24, 0.08)',
}

const serif: CSSProperties = { fontFamily: "'Fraunces', serif" }
const sans: CSSProperties = { fontFamily: "'Inter', sans-serif" }

interface NavLinkProps {
  label: string
}

function NavLink({ label }: NavLinkProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href="#"
      style={{
        ...sans,
        color: hovered ? c.gold : c.muted,
        textDecoration: 'none',
        fontSize: '11px',
        letterSpacing: '1.5px',
        transition: 'color 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </a>
  )
}

interface JournalArticleProps {
  title: string
  date: string
  image: string
}

function JournalArticle({ title, date, image }: JournalArticleProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        borderTop: `0.5px solid ${c.border}`,
        padding: '18px 0 18px 24px',
        cursor: 'pointer',
        backgroundColor: hovered ? 'rgba(198,166,103,0.02)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: '90px',
          height: '60px',
          overflow: 'hidden',
          flexShrink: 0,
          border: `0.5px solid ${hovered ? c.gold : c.border}`,
          transition: 'border-color 0.25s',
        }}
      >
        <img
          src={image}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.08)' : 'scale(1.0)',
            transition: 'transform 0.5s ease',
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            ...serif,
            fontSize: '14px',
            color: hovered ? c.gold : c.cream,
            margin: '0 0 8px',
            lineHeight: 1.3,
            transition: 'color 0.25s',
          }}
        >
          {title}
        </p>
        <p style={{ ...sans, fontSize: '10px', color: c.dim, margin: 0, letterSpacing: '0.5px' }}>{date}</p>
      </div>
    </div>
  )
}

interface ServiceCardProps {
  side: 'dark' | 'light'
  label: string
  heading: string
  body: string
  linkText: string
  headingColor: string
  bodyColor: string
  linkColor: string
}

function ServiceCard({
  side,
  label,
  heading,
  body,
  linkText,
  headingColor,
  bodyColor,
  linkColor,
}: ServiceCardProps) {
  const [hovered, setHovered] = useState(false)
  const isDark = side === 'dark'

  const baseBg = isDark ? 'rgba(23, 27, 24, 0.90)' : 'rgba(250, 248, 243, 0.55)'
  const hoverBg = isDark ? 'rgba(23, 27, 24, 0.95)' : 'rgba(250, 248, 243, 0.85)'
  const borderColor = isDark ? 'rgba(198, 166, 103, 0.25)' : 'rgba(23, 27, 24, 0.12)'
  const hoverBorderColor = isDark ? c.gold : c.goldDark

  return (
    <div
      style={{
        backgroundColor: hovered ? hoverBg : baseBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `0.5px solid ${hovered ? hoverBorderColor : borderColor}`,
        padding: '56px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '380px',
        transition: 'all 0.35s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <p style={{ ...sans, fontSize: '9px', letterSpacing: '3px', color: isDark ? c.dim : c.goldDark, margin: '0 0 28px' }}>
          {label}
        </p>
        <h2 style={{ ...serif, fontWeight: 500, fontSize: 'clamp(24px, 2.4vw, 32px)', lineHeight: 1.2, color: headingColor, margin: '0 0 20px' }}>
          {heading}
        </h2>
        <p style={{ ...sans, fontSize: '13px', lineHeight: 1.75, color: bodyColor, margin: 0, maxWidth: '360px' }}>
          {body}
        </p>
      </div>
      <a
        href="#"
        style={{
          ...sans,
          fontSize: '11px',
          color: linkColor,
          textDecoration: 'none',
          borderBottom: `0.5px solid ${linkColor}`,
          paddingBottom: '2px',
          alignSelf: 'flex-start',
          letterSpacing: '0.5px',
          marginTop: '32px',
        }}
      >
        {linkText}
      </a>
    </div>
  )
}

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [scrollFraction, setScrollFraction] = useState(0)
  const [heroHovering, setHeroHovering] = useState(false)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [storyHovered, setStoryHovered] = useState(false)
  const [aboutHovered, setAboutHovered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Toggle sticky nav background
      setScrolled(window.scrollY > 60)

      // Calculate scroll fraction (0 to 1) for driving the 3D camera path
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight
      const winHeight = window.innerHeight
      const totalScrollable = docHeight - winHeight
      if (totalScrollable > 0) {
        setScrollFraction(scrollTop / totalScrollable)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const bloomMask = `radial-gradient(circle at ${cursor.x}px ${cursor.y}px, #000 90px, transparent 160px)`

  const partners = [
    'United Nations',
    'Morgan Stanley',
    'Apollo Global Management',
    'General Atlantic',
    'Walmart',
    'The World Bank',
    'Rothschild & Co',
    'KKR',
  ]

  const sectionRanges = useSectionScrollRanges([
    'hero',
    'about',
    'services',
    'clients',
    'journal',
    'footer',
  ])

  return (
    <div style={{ ...sans, backgroundColor: '#EFE9DC', color: c.cream, minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      
      {/* ─── 3D BACKGROUND CANVAS ──────────────────────────── */}
      <PlantScene scrollFraction={scrollFraction} sectionRanges={sectionRanges} />

      {/* ─── NAV ──────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '22px 52px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: scrolled ? 'rgba(239, 233, 220, 0.90)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? `0.5px solid ${c.border}` : 'none',
          transition: 'background-color 0.4s, border 0.4s, backdrop-filter 0.4s',
        }}
      >
        <span style={{ ...serif, fontSize: '13px', letterSpacing: '3.5px', color: c.cream }}>EARTHYAN</span>
        <div style={{ display: 'flex', gap: '36px' }}>
          {['Business', 'Professionals', 'Clients', 'Journal', 'Contact'].map((l) => (
            <NavLink key={l} label={l} />
          ))}
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <div
        data-plant-section="hero"
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          backgroundColor: 'transparent',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 52px 80px',
        }}
        onPointerEnter={() => setHeroHovering(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHeroHovering(false)}
      >
        {/* dot grid base */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle at center, rgba(198,166,103,0.14) 1px, transparent 1.2px)',
            backgroundSize: '26px 26px',
            zIndex: -1,
          }}
        />
        {/* dot grid bloom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle at center, rgba(198,166,103,0.45) 1.8px, transparent 2px)',
            backgroundSize: '26px 26px',
            opacity: heroHovering ? 1 : 0,
            maskImage: bloomMask,
            WebkitMaskImage: bloomMask,
            transition: 'opacity 0.3s',
            zIndex: -1,
          }}
        />

        {/* Graticule coordinate grid */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none', zIndex: -1 }}
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* horizontal parallels */}
          {[70, 140, 210, 280, 350, 420, 490, 560, 630].map((y) => (
            <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#7E735B" strokeWidth="0.6" />
          ))}
          {/* vertical meridians */}
          {[80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="700" stroke="#7E735B" strokeWidth="0.6" />
          ))}
        </svg>

        {/* Cartographic graticule globe & compass rose — upper-right quadrant */}
        <svg
          style={{ position: 'absolute', top: '-8%', right: '-4%', width: '58%', maxWidth: '680px', opacity: 0.12, pointerEvents: 'none', zIndex: -1 }}
          viewBox="0 0 500 500"
          aria-hidden="true"
        >
          {/* Outer astronomical rings */}
          <circle cx="250" cy="250" r="220" fill="none" stroke="#7E735B" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="250" cy="250" r="180" fill="none" stroke="#7E735B" strokeWidth="0.5" />
          <circle cx="250" cy="250" r="120" fill="none" stroke="#7E735B" strokeWidth="0.5" />
          <circle cx="250" cy="250" r="45" fill="none" stroke="#7E735B" strokeWidth="0.8" />

          {/* Latitude parallels (horizontal 3D perspective projection) */}
          <line x1="30" y1="250" x2="470" y2="250" stroke="#7E735B" strokeWidth="0.8" />
          <path d="M 52,170 A 202 202 0 0 1 448 170" fill="none" stroke="#7E735B" strokeWidth="0.5" />
          <path d="M 107,100 A 202 202 0 0 1 393 100" fill="none" stroke="#7E735B" strokeWidth="0.5" />
          <path d="M 52,330 A 202 202 0 0 0 448 330" fill="none" stroke="#7E735B" strokeWidth="0.5" />
          <path d="M 107,400 A 202 202 0 0 0 393 400" fill="none" stroke="#7E735B" strokeWidth="0.5" />

          {/* Longitude meridians (vertical 3D perspective projection) */}
          <line x1="250" y1="30" x2="250" y2="470" stroke="#7E735B" strokeWidth="0.8" />
          <path d="M 170,52 A 202 202 0 0 0 170 448" fill="none" stroke="#7E735B" strokeWidth="0.5" />
          <path d="M 100,107 A 202 202 0 0 0 100 393" fill="none" stroke="#7E735B" strokeWidth="0.5" />
          <path d="M 330,52 A 202 202 0 0 1 330 448" fill="none" stroke="#7E735B" strokeWidth="0.5" />
          <path d="M 400,107 A 202 202 0 0 1 400 393" fill="none" stroke="#7E735B" strokeWidth="0.5" />

          {/* Central Compass Rose Star */}
          {/* North Point */}
          <polygon points="250,250 250,190 254,250" fill={c.gold} />
          <polygon points="250,250 250,190 246,250" fill="none" stroke={c.gold} strokeWidth="0.5" />
          {/* South Point */}
          <polygon points="250,250 250,310 246,250" fill={c.gold} />
          <polygon points="250,250 250,310 254,250" fill="none" stroke={c.gold} strokeWidth="0.5" />
          {/* East Point */}
          <polygon points="250,250 310,250 250,254" fill={c.gold} />
          <polygon points="250,250 310,250 250,246" fill="none" stroke={c.gold} strokeWidth="0.5" />
          {/* West Point */}
          <polygon points="250,250 190,250 250,246" fill={c.gold} />
          <polygon points="250,250 190,250 250,254" fill="none" stroke={c.gold} strokeWidth="0.5" />
          {/* Diagonal Points */}
          <polygon points="250,250 280,220 274,226" fill={c.gold} opacity="0.75" />
          <polygon points="250,250 220,220 226,226" fill="none" stroke={c.gold} strokeWidth="0.5" />
          <polygon points="250,250 280,280 274,274" fill="none" stroke={c.gold} strokeWidth="0.5" />
          <polygon points="250,250 220,280 226,274" fill={c.gold} opacity="0.75" />

          {/* Compass Letters */}
          <text x="250" y="178" textAnchor="middle" fill={c.gold} fontSize="12" fontFamily="'Fraunces', serif" fontWeight="600">N</text>
          <text x="250" y="329" textAnchor="middle" fill={c.gold} fontSize="12" fontFamily="'Fraunces', serif" fontWeight="600">S</text>
          <text x="323" y="254" textAnchor="middle" fill={c.gold} fontSize="12" fontFamily="'Fraunces', serif" fontWeight="600">E</text>
          <text x="177" y="254" textAnchor="middle" fill={c.gold} fontSize="12" fontFamily="'Fraunces', serif" fontWeight="600">W</text>
        </svg>

        {/* overline */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <span style={{ display: 'inline-block', width: '36px', height: '0.5px', background: c.gold, flexShrink: 0 }} />
          <span style={{ fontSize: '9px', letterSpacing: '3px', color: c.gold }}>A GLOBAL FAMILY OFFICE, SINCE 2004</span>
        </div>

        {/* headline */}
        <h1 style={{ position: 'relative', ...serif, fontWeight: 500, fontSize: 'clamp(58px, 9vw, 126px)', lineHeight: 0.92, color: c.cream, margin: '0 0 56px', letterSpacing: '-0.01em' }}>
          The world,<br />
          <em style={{ color: c.gold, fontStyle: 'italic' }}>without</em><br />
          borders.
        </h1>

        {/* bottom row */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <p style={{ fontSize: '13px', lineHeight: 1.75, color: c.muted, margin: 0, maxWidth: '360px' }}>
            Twenty years handling the parts of business and life<br />
            that don't fit in a normal firm's remit.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <button style={{ ...sans, fontSize: '11px', letterSpacing: '1px', background: c.gold, color: c.deep, padding: '15px 30px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              Start a conversation
            </button>
            <a href="#" style={{ fontSize: '11px', color: c.gold, textDecoration: 'none', borderBottom: `0.5px solid ${c.gold}`, paddingBottom: '2px', letterSpacing: '0.5px' }}>
              How we work →
            </a>
          </div>
        </div>

        {/* scroll label */}
        <div style={{ position: 'absolute', right: '52px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontSize: '9px', letterSpacing: '3px', color: c.dim, pointerEvents: 'none' }}>
          SCROLL
        </div>
      </div>

      {/* ─── PARTNER TICKER ───────────────────────────────── */}
      <div
        style={{
          backgroundColor: 'rgba(239, 233, 220, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: `0.5px solid ${c.border}`,
          borderBottom: `0.5px solid ${c.border}`,
          padding: '18px 0',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="animate-marquee" style={{ display: 'flex', alignItems: 'center' }}>
          {[0, 1].map((i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '64px', paddingRight: '64px' }}>
              {partners.map((name) => (
                <span
                  key={name}
                  style={{
                    fontSize: '10px',
                    letterSpacing: '2.5px',
                    color: c.gold,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    opacity: 0.85,
                    fontWeight: 500,
                  }}
                >
                  {name}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ─── ABOUT / QUOTE ────────────────────────────────── */}
      {/* Shift content to the right side (col 2) to leave the left side open for Leaf 1 (bottom left) */}
      <div
        data-plant-section="about"
        style={{
          backgroundColor: 'transparent',
          padding: '110px 52px',
          display: 'grid',
          gridTemplateColumns: '58% 42%',
          gap: '80px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div /> {/* Left side spacer for the 3D plant zoom */}
        <div
          onMouseEnter={() => setAboutHovered(true)}
          onMouseLeave={() => setAboutHovered(false)}
          style={{
            border: `0.5px solid ${aboutHovered ? c.gold : c.border}`,
            padding: '44px 48px',
            backgroundColor: aboutHovered ? 'rgba(250, 248, 243, 0.85)' : 'rgba(250, 248, 243, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transition: 'all 0.35s ease',
          }}
        >
          <p style={{ ...serif, fontStyle: 'italic', fontSize: 'clamp(24px, 2.5vw, 36px)', lineHeight: 1.25, color: c.cream, margin: '0 0 28px' }}>
            "We deal with the complexity so you don't have to."
          </p>
          <p style={{ fontSize: '13px', lineHeight: 1.85, color: c.muted, margin: '0 0 44px' }}>
            Started as the private office for one family. Still runs like one — a small client list, kept mostly by referral. We take on work that falls outside the normal firm's remit: the problem that sits at the intersection of business, law, and geography.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '48px', justifyContent: 'start' }}>
            {[
              { n: '20', sub: 'Years navigating\nglobal complexity' },
              { n: '5', sub: 'Continents of\nactive client work' },
              { n: "'04", sub: 'Founded as a\nprivate family office' },
            ].map(({ n, sub }) => (
              <div key={n}>
                <p style={{ ...serif, fontSize: '36px', color: c.gold, margin: '0 0 8px', lineHeight: 1 }}>{n}</p>
                <p style={{ fontSize: '10px', letterSpacing: '0.3px', color: c.dim, margin: 0, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SERVICES SPLIT ───────────────────────────────── */}
      {/* Shift content to the left side (55%) to leave the right side open for Leaf 2 (lower right) */}
      <div
        data-plant-section="services"
        style={{
          display: 'grid',
          gridTemplateColumns: '55% 45%',
          padding: '110px 52px',
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <p style={{ ...sans, fontSize: '9px', letterSpacing: '3px', color: c.gold, margin: '0 0 8px' }}>CORE SERVICES</p>
          <ServiceCard
            side="dark"
            label="01 / BUSINESS"
            heading="Strategy, compliance, and operations across borders."
            body="Organizations operating in complex jurisdictions need more than standard advisory. We handle structure, compliance, and the work that falls between legal, finance, and operations."
            linkText="See what we handle →"
            headingColor="#FAF8F3"
            bodyColor="#9DA6A0"
            linkColor="#C6A667"
          />
          <ServiceCard
            side="light"
            label="02 / PROFESSIONALS & FAMILIES"
            heading="Relocation, education, and concierge travel."
            body="Moving a family, an executive, or an institution across borders involves more than logistics. We handle the parts that require judgment: schools, residencies, and the travel that cannot go wrong."
            linkText="Start here →"
            headingColor={c.deep}
            bodyColor={c.muted}
            linkColor={c.goldDark}
          />
        </div>
        <div /> {/* Right side spacer for 3D plant zoom */}
      </div>

      {/* ─── CLIENT STORY ─────────────────────────────────── */}
      {/* Shift content to the right side to leave the left side open for Leaf 3 (upper left) */}
      <div
        data-plant-section="clients"
        style={{
          backgroundColor: 'transparent',
          padding: '110px 52px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ width: '100%', maxWidth: '620px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', color: c.dim, margin: '0 0 48px' }}>CLIENT WORK</p>
          <div
            style={{ position: 'relative', cursor: 'default' }}
            onMouseEnter={() => setStoryHovered(true)}
            onMouseLeave={() => setStoryHovered(false)}
          >
            <span
              style={{
                position: 'absolute',
                top: '-11px',
                right: '28px',
                background: c.goldDark,
                color: '#FAF8F3',
                fontSize: '8px',
                letterSpacing: '2px',
                padding: '4px 14px',
                zIndex: 12,
              }}
            >
              CONFIDENTIAL
            </span>
            <div
              style={{
                border: `0.5px solid ${storyHovered ? c.gold : c.border}`,
                padding: '44px 48px',
                backgroundColor: storyHovered ? 'rgba(250, 248, 243, 0.85)' : 'rgba(250, 248, 243, 0.55)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                transition: 'all 0.35s ease',
              }}
            >
              <p style={{ fontSize: '9px', letterSpacing: '2.5px', color: c.gold, margin: '0 0 18px' }}>A CLIENT STORY</p>
              <p style={{ ...serif, fontSize: 'clamp(17px, 2vw, 23px)', lineHeight: 1.5, color: c.cream, margin: '0 0 24px' }}>
                A member of a leading political dynasty needed private medical treatment abroad — urgently, and quietly.
              </p>
              <p style={{ fontSize: '13px', lineHeight: 1.85, color: c.muted, margin: '0 0 14px' }}>
                Within 48 hours, we had arranged transport, accommodation, specialist access, and a cover narrative — coordinating across three time zones and four stakeholders who could not communicate directly with each other.
              </p>
              <p style={{ fontSize: '13px', lineHeight: 1.85, color: c.muted, margin: 0 }}>
                The client returned home without incident. The treatment was never reported.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── JOURNAL ──────────────────────────────────────── */}
      <div data-plant-section="journal" style={{ backgroundColor: 'rgba(244, 238, 223, 0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: `0.5px solid ${c.border}`, padding: '88px 52px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '44px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '3px', color: c.dim, margin: 0 }}>FROM THE JOURNAL</p>
          <a href="#" style={{ fontSize: '11px', color: c.gold, textDecoration: 'none', letterSpacing: '0.5px' }}>
            All articles →
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 0 }}>
          {/* featured */}
          <div style={{ borderTop: `0.5px solid ${c.border}`, paddingTop: '32px', paddingRight: '60px', paddingBottom: '32px' }}>
            <p style={{ fontSize: '9px', letterSpacing: '2px', color: c.dim, margin: '0 0 18px' }}>FEATURED</p>
            <FeaturedArticle />
          </div>
          {/* secondary */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <JournalArticle
              title="Transiting Paris (CDG) on Air France"
              date="18 June 2025"
              image="/journal_paris.png"
            />
            <JournalArticle
              title="Five days, Northeastern Spain"
              date="10 June 2025"
              image="/journal_spain.png"
            />
            <JournalArticle
              title="The case for a second passport, revisited"
              date="2 June 2025"
              image="/journal_passport.png"
            />
          </div>
        </div>
      </div>

      {/* ─── FOOTER SECTION CONTAINER ──────────────────────── */}
      <div data-plant-section="footer">
        {/* ─── CONTACT CTA ──────────────────────────────────── */}
        <div
          style={{
            backgroundColor: 'transparent',
            padding: '88px 52px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `0.5px solid ${c.border}`,
            flexWrap: 'wrap',
            gap: '24px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <p style={{ ...serif, fontStyle: 'italic', fontSize: 'clamp(16px, 2vw, 26px)', color: c.muted, margin: 0 }}>
            Consultations start with a conversation, not a form.
          </p>
          <a
            href="mailto:concierge@earthyan.com"
            style={{
              fontSize: '13px',
              color: c.gold,
              textDecoration: 'none',
              letterSpacing: '0.5px',
              borderBottom: `0.5px solid ${c.gold}`,
              paddingBottom: '2px',
            }}
          >
            concierge@earthyan.com
          </a>
        </div>

        {/* ─── FOOTER ───────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: 'rgba(239, 233, 220, 0.9)',
            backdropFilter: 'blur(8px)',
            padding: '26px 52px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `0.5px solid ${c.border}`,
            position: 'relative',
            zIndex: 10,
          }}
        >
          <span style={{ ...serif, fontSize: '12px', letterSpacing: '3px', color: c.cream }}>EARTHYAN</span>
          <span style={{ fontSize: '10px', color: c.dim, letterSpacing: '0.3px' }}>
            © 2025 · Business · Professionals · Clients · Journal · Contact
          </span>
        </div>
      </div>

    </div>
  )
}

function FeaturedArticle() {
  const [hovered, setHovered] = useState(false)
  return (
    <>
      <div
        style={{
          width: '100%',
          height: '240px',
          overflow: 'hidden',
          marginBottom: '28px',
          border: `0.5px solid ${hovered ? c.gold : c.border}`,
          transition: 'border-color 0.25s',
          position: 'relative',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src="/journal_featured.png"
          alt="SEO vs. AIEO Cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.05)' : 'scale(1.0)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
      <h3
        style={{
          ...serif,
          fontWeight: 500,
          fontSize: 'clamp(20px, 2.2vw, 30px)',
          lineHeight: 1.25,
          color: hovered ? c.gold : c.cream,
          margin: '0 0 14px',
          cursor: 'pointer',
          transition: 'color 0.25s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        SEO vs. AIEO: what changes when AI reads your site first
      </h3>
      <p style={{ fontSize: '13px', lineHeight: 1.75, color: c.muted, margin: '0 0 24px', maxWidth: '440px' }}>
        Search is no longer the first entry point to your business. Increasingly, the first reader is an AI agent, and it doesn't care about your page title.
      </p>
      <p style={{ fontSize: '11px', color: c.dim, margin: 0, letterSpacing: '0.3px' }}>23 June 2025 — Aditya Gupta</p>
    </>
  )
}
