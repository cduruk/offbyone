import React from 'react'
import { ControlSlider } from './ControlSlider'
import { ImpactAnalysis } from './ImpactAnalysis'
import { PERSONAS } from '@/components/poisson-interrupt/constants'
import { H3 } from './Typography'
import { Button } from '@/components/ui/button'

interface SimulationControlsProps {
  selectedPersonaId: string
  lambda: number
  recovery: number
  onPersonaSelect: (id: string) => void
  onLambdaChange: (val: number) => void
  onRecoveryChange: (val: number) => void
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  selectedPersonaId,
  lambda,
  recovery,
  onPersonaSelect,
  onLambdaChange,
  onRecoveryChange,
}) => {
  return (
    <div className="border-b border-l-4 border-gray-200 border-l-amber-500/40 bg-amber-50/50 p-6">
      {/* Persona Grid */}
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <H3>Define Your Environment</H3>
          <span className="hidden text-xs text-gray-500 sm:inline">
            Choose a persona or adjust parameters
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {PERSONAS.map((p) => (
            <Button
              key={p.id}
              variant="outline"
              onClick={() => onPersonaSelect(p.id)}
              className={`relative flex h-auto flex-col items-center rounded-sm border-2 p-3 text-center transition-all duration-200 ${
                selectedPersonaId === p.id
                  ? 'border-gray-900 bg-gray-100 ring-1 ring-gray-900/15'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              <div
                className={`mb-2 rounded-sm p-1.5 ${selectedPersonaId === p.id ? 'bg-gray-200 text-gray-900' : 'bg-gray-200 text-gray-500'}`}
              >
                <p.icon size={20} strokeWidth={2} />
              </div>
              <div className="text-xs font-bold text-gray-900">{p.label}</div>
            </Button>
          ))}
        </div>
      </div>

      {/* Parameters Section - Always Visible */}
      <div className="relative mt-6 border-t border-gray-200 pt-6">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-white px-3 py-0.5 text-[10px] font-medium tracking-wide text-gray-500 uppercase">
          Parameters
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Sliders */}
          <div className="flex-1 space-y-4">
            <ControlSlider
              label="Interruptions / Hour (λ)"
              value={lambda}
              min={0.1}
              max={4}
              step={0.1}
              onChange={onLambdaChange}
            />
            <ControlSlider
              label="Recovery Time (Δ)"
              value={recovery}
              min={0}
              max={45}
              step={1}
              unit="min"
              onChange={onRecoveryChange}
            />
          </div>

          {/* Impact Analysis */}
          <div className="flex-1 md:max-w-xs">
            <ImpactAnalysis lambda={lambda} recovery={recovery} />
          </div>
        </div>
      </div>
    </div>
  )
}
