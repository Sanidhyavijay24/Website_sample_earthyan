# Earthyan — A World Without Borders

A premium, creative, and highly responsive landing page redesign for **Earthyan**, reflecting its identity as a boutique global family-office and consultancy. Built with React, TypeScript, Three.js (React Three Fiber/Drei), and Tailwind CSS v4.0.0.

## Key Design & Technology Highlights

### 1. Quiet Luxury Sandstone Theme
* A custom cartographic color palette featuring **Warm Sandstone Linen (`#EFE9DC`)**, deep **Forest-Charcoal (`#121613`)** text, and warm **Antique Gold (`#9C7A3C`)** highlights.
* Frosted glassmorphic panels (`backdrop-filter: blur(12px)`) that preserve 100% text readability while overlaying background elements.

### 2. Interactive 3D Lotus Model & Dynamic Scroll Rigging
* Renders a massive, high-definition 3D Lotus model (`/plant.glb`) with custom-tuned clearcoat shaders (porcelain waxy finish).
* Features a custom React hook `useSectionScrollRanges.ts` that measures the precise bounding coordinates of page sections dynamically (adapting to window resize and content reflows).
* The 3D camera transitions fluidly from shot-to-shot using **frame-rate independent damping** and settles 45% into each section range so that the model remains stationary while the user reads.

### 3. Editorial Imagery & Typography
* Custom serif headline font (**Fraunces**) paired with modern sans-serif body typography (**Inter**).
* Embedded high-end, hover-zooming editorial card covers and article thumbnails representing global travel and consultancy narratives.
* Background cartographic graticule parallel/meridian grids and a central compass rose star to anchor the globe motif.

---

## Tech Stack
* **Runtime & Package Manager:** Bun (v1.x)
* **Frontend Library:** React 19 + TypeScript
* **Styling:** Tailwind CSS v4.0.0 (integrated via Vite compiler plugin)
* **Build Tool:** Vite v8.0.0
* **Graphics:** Three.js, React Three Fiber, React Three Drei

---

## Getting Started

### Prerequisites
Make sure you have [Bun](https://bun.sh/) installed.

### Installation
Clone the repository and install dependencies:
```bash
bun install
```

### Run Locally
Start the local development server:
```bash
bun run dev
```
Open `http://localhost:8443` in your browser.

### Build
To compile the static client bundle for production:
```bash
bun run build
```
The output will be generated inside the `dist/` directory.


Made by Sanidhya