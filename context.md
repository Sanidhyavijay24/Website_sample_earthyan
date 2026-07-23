# Context

## Project Overview
Redesign the frontend of earthyan.com to make it premium, professional, aesthetic, and creative, reflecting its identity as a boutique global family-office/consultancy. The design focuses on a "quiet luxury" theme using a refined Forest Green and Gold color palette, custom cartographic/topographic motifs, and elegant serif typography (Fraunces + Inter).

## Tech Stack
- **Runtime & Package Manager:** Bun (v1.x)
- **Frontend Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4.0.0 (integrated via Vite plugin)
- **Build Tool:** Vite v8.0.0
- **3D Graphics:** Three.js, React Three Fiber, React Three Drei
- **Database:** None (Static site / Client-only frontend mockup)

## Architecture
- `c:\Codes\earthyan_redesign\`
  - `src/`
    - `components/`
      - `PlantScene.tsx` (Procedural 3D plant scene and scroll controller)
    - `App.tsx` (Main layout, landing page text overlay panels)
    - `main.tsx` (React application entry point)
    - `index.css` (Tailwind & custom styling rules)
    - `vite-env.d.ts` (Vite type definitions)
  - `package.json` (Project dependencies and build scripts)
  - `tsconfig.json` (TypeScript compilation setup)
  - `vite.config.ts` (Vite bundler configuration with custom Figma mockup plugins)
  - `Earthyan_Redesign_Build_Plan.md` (Design specifications and rollout milestones)
  - `Earthyan_Website_Audit.docx` (Content audit of original site)
  - `context.md` (This context ledger file)

## Feature Status Checklist
- [x] Get the forest-green & gold mockup running locally (`bun run dev`)
- [x] Edit/update `Earthyan_Redesign_Build_Plan.md` to match the new mockup design, colors, and styling philosophy
- [x] Implement dynamic scroll-bound 3D plant zoom/pan animation
- [x] Optimize text overlay panel positions (asymmetrical offsets for 3D visibility)
- [x] Redesign partner marquee ticker strip into premium glassmorphic style
- [x] Implement Light Sandstone color palette (Option A) across the entire UI
- [ ] Audit responsive behavior (mobile-first, 480/768/1024/1440px)
- [ ] Refine typography and accessibility (WCAG AA contrast, keyboard navigation)

## Data Models
N/A (All page content is currently static/client-side data-driven components in React).

## API Contracts
N/A (Static site pitch).

## Technical Debt
- Clean up any unused files or template configurations.
- Ensure proper configuration of Tailwind v4.0.0 imports in `index.css` to prevent duplicate or conflicting CSS rules.
