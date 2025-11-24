import React from 'react'
import { RefreshCw } from 'lucide-react'
import type { DeepWorkThreshold } from '@/components/poisson-interrupt/constants'
import { H3 } from './Typography'
import { Button } from '@/components/ui/button'

interface SimulationStatsProps {
  goodDaysCount: number
  targetBlockCount: number
  threshold: DeepWorkThreshold
  onReseed: () => void
}

export const SimulationStats: React.FC<SimulationStatsProps> = ({
  goodDaysCount,
  targetBlockCount,
  threshold,
  onReseed,
}) => {
  return (
    <div className="border-b border-l-4 border-gray-200 border-l-teal-500/40 bg-teal-50/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <H3>Your Likelihood of Success</H3>
        <Button
          variant="ghost"
          onClick={onReseed}
          className="flex h-auto items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
        >
          <RefreshCw size={14} />
          <span>Re-run</span>
        </Button>
      </div>

      <div className="flex items-baseline text-gray-900">
        <span className="mr-3 text-4xl font-bold text-gray-900">
          {goodDaysCount}%
        </span>
        <span className="text-sm font-medium">
          likelihood of achieving{' '}
          {targetBlockCount > 1 ? `${targetBlockCount} blocks` : 'a block'} &ge;{' '}
          {threshold} min on any given day
        </span>
      </div>
    </div>
  )
}
