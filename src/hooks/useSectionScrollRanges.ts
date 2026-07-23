/**
 * @file useSectionScrollRanges.ts
 * @description Measures the real scroll-position range covered by every
 * element tagged `data-plant-section="<id>"`, expressed as a 0-1 fraction
 * of total page-scroll height. Recomputed on resize, so it stays accurate
 * if content reflows (e.g. the Journal grid wrapping to an extra row on a
 * narrower viewport).
 *
 * This is what makes PlantScene's shots line up with the actual section
 * boundaries instead of an evenly-guessed split — the guessed split is the
 * main reason the current camera hits the wrong leaf/position for a given
 * section: your sections are NOT equal height (the Business/Professionals
 * card stack and the Journal grid are both much taller than the Hero), so
 * an equal 1/6th-per-section assumption drifts out of sync almost
 * immediately.
 *
 * Usage:
 *   const SECTION_IDS = ['hero','about','business','professionals','clients','journal','footer']
 *   const sectionRanges = useSectionScrollRanges(SECTION_IDS)
 *   <PlantScene sectionRanges={sectionRanges} />
 *   ...
 *   <section data-plant-section="hero">...</section>
 *   <section data-plant-section="about">...</section>
 *   // etc — id must match a shot id in PlantScene's DEFAULT_SHOTS
 */

import { useCallback, useEffect, useState } from 'react'

export interface SectionRange {
  id: string
  start: number
  end: number
}

export function useSectionScrollRanges(ids: string[]): SectionRange[] {
  const [ranges, setRanges] = useState<SectionRange[]>([])

  // Serialize the ids array as a string key to prevent infinite loop callbacks on inline array declarations
  const idsKey = ids.join(',')

  const measure = useCallback(() => {
    const doc = document.documentElement
    const totalScrollable = doc.scrollHeight - window.innerHeight
    if (totalScrollable <= 0) return

    const next: SectionRange[] = idsKey.split(',').map((id) => {
      const el = document.querySelector(`[data-plant-section="${id}"]`)
      if (!el) return { id, start: 0, end: 0 }

      const rect = el.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const bottom = top + rect.height

      return {
        id,
        start: Math.max(0, Math.min(1, top / totalScrollable)),
        end: Math.max(0, Math.min(1, bottom / totalScrollable)),
      }
    })

    setRanges(next)
  }, [idsKey])

  useEffect(() => {
    // Measure after layout settles (fonts/images/canvas shift heights right after mount),
    // then again on resize or scroll.
    const raf = requestAnimationFrame(measure)
    
    // Fallback timeouts to capture late layout shifts as images load
    const t1 = setTimeout(measure, 100)
    const t2 = setTimeout(measure, 500)
    const t3 = setTimeout(measure, 1500)

    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [measure])

  return ranges
}