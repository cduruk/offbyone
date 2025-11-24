import { useMemo, useState } from 'react'
import { DaysGrid } from './DaysGrid'
import { simulateDays } from '@/components/poisson-interrupt/simulation'
import { Play } from 'lucide-react'

interface DaysGridEmbedProps {
  lambda?: number
  delta?: number
  len?: 30 | 45 | 60
  target?: number
  seed?: number
  onSelectDay?: (dayIndex: number) => void
  showOverlay?: boolean
}

/**
 * Standalone embeddable grid component for blog posts.
 * Pass simulation parameters as props - no URL routing needed.
 *
 * Example usage in Astro MDX:
 * ```mdx
 * <DaysGridEmbed
 *   lambda={1.0}
 *   delta={11}
 *   len={60}
 *   target={1}
 *   seed={12345}
 *   showOverlay={true}
 *   client:load
 * />
 * ```
 */
export function DaysGridEmbed({
  lambda = 1.0,
  delta = 11,
  len = 60,
  target = 1,
  seed = 12345,
  onSelectDay,
  showOverlay = true,
}: DaysGridEmbedProps) {
  const [isRevealed, setIsRevealed] = useState(!showOverlay)

  // Generate simulation data
  const daysData = useMemo(
    () => simulateDays(100, lambda, delta, seed),
    [lambda, delta, seed],
  )

  // Default handler for day selection (no-op if not provided)
  const handleSelectDay = (dayIndex: number) => {
    if (onSelectDay) {
      onSelectDay(dayIndex)
    }
    // No-op if onSelectDay is not provided
  }

  return (
    <div className="relative w-full">
      {showOverlay && !isRevealed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
          <button
            onClick={() => setIsRevealed(true)}
            className="group flex flex-col items-center gap-4 px-8 py-6 transition-transform duration-200 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-teal-500 p-3 shadow-lg transition-all duration-200 group-hover:bg-teal-600 group-hover:shadow-xl">
                <Play size={24} className="fill-white text-white" />
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold text-gray-900">
                  View 100-Day Simulation
                </div>
                <div className="text-sm text-gray-600">
                  λ = {lambda}/hr · δ = {delta}m · threshold = {len}m
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Click to view interactive grid
            </div>
          </button>
        </div>
      )}
      <div
        className={
          showOverlay && !isRevealed ? 'pointer-events-none opacity-20' : ''
        }
      >
        <DaysGrid
          daysData={daysData}
          threshold={len}
          targetBlockCount={target}
          onSelectDay={handleSelectDay}
          lambda={lambda}
          delta={delta}
        />
      </div>
    </div>
  )
}
