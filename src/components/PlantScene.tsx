/**
 * @file PlantScene.tsx
 * @description Renders the 3D plant model (Lotus cluster) with scroll-bound
 * camera keyframing.
 *
 * Design: each "shot" owns a RANGE of scroll progress, not an equal slice.
 * The camera eases into a shot over the first ~45% of that range, then
 * holds steady for the rest — that's the settle a reader needs while
 * they're actually reading the section's copy, instead of the plant
 * continuing to drift underneath them.
 *
 * Every section gets its own real shot — none of them are treated as
 * "hidden". The Business/Professionals cards and the Journal grid sit on
 * translucent glassmorphic panels (backdrop-filter: blur), so the plant
 * is meant to read through them as a soft green/gold silhouette; the CSS
 * blur on those panels does the softening automatically since the canvas
 * sits behind them in the DOM. All that matters here is framing a shot
 * that still looks intentional once blurred and dimmed by the panel.
 *
 * @module src/components
 */

import { useRef, useMemo, useEffect, useState, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Center, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Shot list — one entry per named section of the page. `start`/`end` are
// PLACEHOLDER fallbacks (evenly guessed) used only until real measured
// ranges come in via the `sectionRanges` prop — see useSectionScrollRanges.ts.
// Swap the numbers for real ones once you've wired that up; the pos/lookAt/
// modelYaw values themselves you'll still want to eyeball in-browser against
// the actual glb (I can't see the model's real geometry from here).
// ---------------------------------------------------------------------------
interface ShotConfig {
  id: string
  start: number
  end: number
  pos: [number, number, number]
  lookAt: [number, number, number]
  /** Extra yaw applied to the whole plant so a different leaf cluster
   *  turns toward camera for this shot, instead of only dollying around a
   *  perfectly static mesh. */
  modelYaw: number
  /** Material opacity for this shot. Sections behind the glassmorphic
   *  cards default to slightly under 1 so the model doesn't fight the
   *  panel's own blur/tint for attention — tune per section to taste,
   *  this is NOT a hide/show switch, the plant stays visible everywhere. */
  opacity: number
}

// Text columns sit on the LEFT for `services`, so that shot pushes the
// plant to the right of frame (negative lookAt.x); `about` and `clients`
// do the opposite. Matches App.tsx's actual grid spacers, not a guess.
const DEFAULT_SHOTS: ShotConfig[] = [
  { id: 'hero', start: 0.00, end: 0.20, pos: [0.1, 1.7, 4.4], lookAt: [-0.5, 1.3, 0], modelYaw: 0, opacity: 1 },
  { id: 'about', start: 0.20, end: 0.34, pos: [-0.7, 0.4, 2.2], lookAt: [0.9, 0.2, 0], modelYaw: -0.25, opacity: 1 },
  { id: 'services', start: 0.34, end: 0.58, pos: [0.5, -0.4, 2.2], lookAt: [-0.5, -0.5, 0], modelYaw: 0.3, opacity: 0.85 },
  { id: 'clients', start: 0.58, end: 0.74, pos: [-0.5, -1.2, 2.0], lookAt: [0.5, -1.0, 0], modelYaw: -0.15, opacity: 1 },
  { id: 'journal', start: 0.74, end: 0.90, pos: [0.1, -1.6, 2.6], lookAt: [0, -1.5, 0], modelYaw: 0.1, opacity: 0.5 },
  { id: 'footer', start: 0.90, end: 1.00, pos: [0, -1.8, 3.0], lookAt: [0, -1.6, 0], modelYaw: 0, opacity: 1 },
]

export interface SectionRange {
  id: string
  start: number
  end: number
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp(edge1 > edge0 ? (x - edge0) / (edge1 - edge0) : 1, 0, 1)
  return t * t * (3 - 2 * t)
}

function dampVec3(current: THREE.Vector3, target: THREE.Vector3, lambda: number, dt: number) {
  const alpha = 1 - Math.exp(-lambda * dt)
  current.lerp(target, alpha)
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
function LotusModel({
  opacityRef,
  yawRef,
}: {
  opacityRef: React.MutableRefObject<number>
  yawRef: React.MutableRefObject<number>
}) {
  const { scene } = useGLTF('/plant.glb')
  const groupRef = useRef<THREE.Group>(null)

  const materials = useMemo(() => {
    const found: THREE.MeshStandardMaterial[] = []
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh && node.material) {
        node.castShadow = true
        node.receiveShadow = true
        const mat = node.material as THREE.MeshStandardMaterial
        mat.roughness = Math.min(mat.roughness ?? 0.5, 0.25)
        mat.metalness = Math.max(mat.metalness ?? 0.0, 0.2)
        if ('clearcoat' in mat) {
          // @ts-ignore
          mat.clearcoat = 0.9
          // @ts-ignore
          mat.clearcoatRoughness = 0.05
        }
        // needed so opacityRef fades can actually do anything
        mat.transparent = true
        found.push(mat)
      }
    })
    return found
  }, [scene])

  useFrame(() => {
    for (const mat of materials) mat.opacity = opacityRef.current
    if (groupRef.current) groupRef.current.rotation.y = 0.15 + yawRef.current
  })

  // X-pitch 0.3 / Z-roll 0 stay fixed — only yaw (Y) moves per-shot.
  return (
    <group ref={groupRef} rotation={[0.3, 0.15, 0]}>
      <primitive object={scene} scale={[7, 7, 7]} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Camera rig
// ---------------------------------------------------------------------------
function CameraController({
  scrollFraction,
  shots,
  opacityRef,
  yawRef,
}: {
  scrollFraction: number
  shots: ShotConfig[]
  opacityRef: React.MutableRefObject<number>
  yawRef: React.MutableRefObject<number>
}) {
  const { camera } = useThree()
  const lookAtRef = useRef(new THREE.Vector3(...shots[0].lookAt))

  useFrame((_, delta) => {
    const f = THREE.MathUtils.clamp(scrollFraction, 0, 1)
    let activeIndex = 0
    for (let i = 0; i < shots.length; i++) {
      if (f >= shots[i].start && f <= shots[i].end) {
        activeIndex = i
        break
      }
    }

    const prev = shots[activeIndex]
    const curr = shots[Math.min(shots.length - 1, activeIndex + 1)]

    const span = prev.end - prev.start || 1
    const localT = (f - prev.start) / span

    const posT = smoothstep(0, 0.45, localT)   // camera settles by 45% into the section
    const fadeT = smoothstep(0, 0.15, localT)  // opacity crossfades fast, near the boundary

    const targetPos = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...prev.pos), new THREE.Vector3(...curr.pos), posT)
    const targetLook = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...prev.lookAt), new THREE.Vector3(...curr.lookAt), posT)
    const targetOpacity = THREE.MathUtils.lerp(prev.opacity, curr.opacity, fadeT)
    const targetYaw = THREE.MathUtils.lerp(prev.modelYaw, curr.modelYaw, posT)

    // Frame-rate-independent smoothing. The old version did
    // camera.position.lerp(target, 0.035) unconditionally every frame,
    // which runs at a different effective speed on a 60Hz vs 120Hz
    // display and visibly lags behind on fast scroll. This converges at
    // the same real-world speed regardless of frame rate.
    dampVec3(camera.position, targetPos, 4, delta)
    dampVec3(lookAtRef.current, targetLook, 4, delta)
    camera.lookAt(lookAtRef.current)

    opacityRef.current = THREE.MathUtils.damp(opacityRef.current, targetOpacity, 6, delta)
    yawRef.current = THREE.MathUtils.damp(yawRef.current, targetYaw, 4, delta)

    if (process.env.NODE_ENV === 'development') {
      // Watch this in the console/React devtools while scrolling to tune
      // the pos/lookAt numbers above against the real model.
      ; (window as any).__plantShot = curr.id
    }
  })

  return null
}

// ---------------------------------------------------------------------------
// Fallback raw scroll fraction, only used if the parent doesn't pass one in.
// Deliberately NOT smoothed here — all smoothing happens once, inside
// CameraController. Smoothing it twice (e.g. once in a Lenis/GSAP layer
// upstream, and again with the old fixed lerp here) compounds into the
// "swimmy", always-catching-up motion you're seeing now.
// ---------------------------------------------------------------------------
function useRawScrollFraction() {
  const [fraction, setFraction] = useState(0)

  const update = useCallback(() => {
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    setFraction(max > 0 ? window.scrollY / max : 0)
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  return fraction
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
interface PlantSceneProps {
  /** Pass this if you already track scroll upstream (Lenis, GSAP
   *  ScrollTrigger, etc). It should be the RAW un-smoothed 0-1 progress —
   *  see the note above about double-smoothing. If omitted, PlantScene
   *  tracks window scroll itself. */
  scrollFraction?: number
  /** Real measured start/end per section, from useSectionScrollRanges.
   *  Falls back to the guessed DEFAULT_SHOTS ranges if omitted. */
  sectionRanges?: SectionRange[]
}

export default function PlantScene({ scrollFraction, sectionRanges }: PlantSceneProps) {
  const internalFraction = useRawScrollFraction()
  const fraction = scrollFraction ?? internalFraction

  const shots = useMemo<ShotConfig[]>(() => {
    if (!sectionRanges?.length) return DEFAULT_SHOTS
    return DEFAULT_SHOTS.map((shot) => {
      const measured = sectionRanges.find((r) => r.id === shot.id)
      return measured ? { ...shot, start: measured.start, end: measured.end } : shot
    })
  }, [sectionRanges])

  const opacityRef = useRef(1)
  const yawRef = useRef(0)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        {/* Soft Ambient Light */}
        <ambientLight intensity={0.5} />

        {/* Cinematic Gold Spotlight */}
        <spotLight
          position={[5, 6, 5]}
          angle={0.3}
          penumbra={1}
          intensity={4.0}
          color="#FFE9C5"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Edge / Backlight for translucent leaf details */}
        <directionalLight position={[-4, 3, -4]} intensity={2.2} color="#C6A667" />

        {/* Soft slate key fill light */}
        <directionalLight position={[-4, -2, 4]} intensity={1.0} color="#A2A9A5" />

        <Suspense fallback={null}>
          <Center>
            <LotusModel opacityRef={opacityRef} yawRef={yawRef} />
          </Center>
        </Suspense>

        <CameraController
          scrollFraction={fraction}
          shots={shots}
          opacityRef={opacityRef}
          yawRef={yawRef}
        />
      </Canvas>
    </div>
  )
}

// Pre-load the glb file so it starts downloading immediately
useGLTF.preload('/plant.glb')