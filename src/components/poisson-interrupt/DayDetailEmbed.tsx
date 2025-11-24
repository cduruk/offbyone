import { useMemo, useState } from 'react'
import { DayDetailView } from './DayDetailView'
import { simulateDays } from '@/components/poisson-interrupt/simulation'

interface DayDetailEmbedProps {
  lambda?: number
  delta?: number
  len?: 30 | 45 | 60
  seed?: number
  day?: number
  showNavigation?: boolean
}

/**
 * Standalone embeddable day detail component for blog posts.
 * Pass simulation parameters as props - no URL routing needed.
 *
 * Example usage in Astro MDX:
 * ```mdx
 * <DayDetailEmbed
 *   lambda={1.0}
 *   delta={11}
 *   len={60}
 *   seed={12345}
 *   day={15}
 *   showNavigation={true}
 *   client:load
 * />
 * ```
 */
export function DayDetailEmbed({
  lambda = 1.0,
  delta = 11,
  len = 60,
  seed = 12345,
  day = 0,
  showNavigation = false,
}: DayDetailEmbedProps) {
  // Track current day index if navigation is enabled
  const [currentDayIndex, setCurrentDayIndex] = useState(day)

  // Generate simulation data
  const daysData = useMemo(
    () => simulateDays(100, lambda, delta, seed),
    [lambda, delta, seed],
  )

  // Get the specific day (clamp to valid range)
  const dayIndex = Math.max(0, Math.min(currentDayIndex, daysData.length - 1))
  const selectedDay = daysData[dayIndex]

  const hasPrev = dayIndex > 0
  const hasNext = dayIndex < daysData.length - 1

  // Navigation handlers
  const handleBack = () => {
    // In embedded context, "back" button is hidden/disabled
  }

  const handleNext = () => {
    if (hasNext) {
      setCurrentDayIndex(dayIndex + 1)
    }
  }

  const handlePrev = () => {
    if (hasPrev) {
      setCurrentDayIndex(dayIndex - 1)
    }
  }

  return (
    <div className="w-full">
      <DayDetailView
        day={selectedDay}
        threshold={len}
        onBack={handleBack}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={showNavigation && hasNext}
        hasPrev={showNavigation && hasPrev}
        lambda={lambda}
        delta={delta}
        showNavigation={showNavigation}
      />
    </div>
  )
}
