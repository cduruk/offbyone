import React from 'react'
import { BodySmall, MonoHighlight } from './Typography'
import { Card } from '@/components/ui/card'

interface ImpactAnalysisProps {
  lambda: number
  recovery: number
}

export const ImpactAnalysis: React.FC<ImpactAnalysisProps> = ({
  lambda,
  recovery,
}) => {
  const avgGap = lambda > 0 ? Math.round(60 / lambda) : '>480'
  const lossPerHour = Math.round(lambda * recovery)

  return (
    <Card className="flex h-full flex-col justify-center rounded-sm border border-gray-200 bg-gray-100 p-4 shadow-none">
      <BodySmall className="space-y-2">
        <p>
          <span className="font-semibold text-gray-900">Pace:</span> At{' '}
          <MonoHighlight>λ={lambda}</MonoHighlight>, interruptions occur roughly
          every <span className="font-bold text-gray-900">{avgGap} min</span>.
        </p>
        <p>
          <span className="font-semibold text-gray-900">Cost:</span> With{' '}
          <MonoHighlight>Δ={recovery}m</MonoHighlight>, you lose ~
          <span className="font-bold text-gray-900">{lossPerHour} min</span> per
          hour to recovery.
        </p>
      </BodySmall>
    </Card>
  )
}
