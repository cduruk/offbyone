import React from 'react'
import type { DeepWorkThreshold } from '@/components/poisson-interrupt/constants'
import { H3, Label, BodySmall } from './Typography'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface GoalDefinitionProps {
  threshold: DeepWorkThreshold
  targetBlockCount: number
  onThresholdChange: (val: DeepWorkThreshold) => void
  onTargetChange: (val: number) => void
}

export const GoalDefinition: React.FC<GoalDefinitionProps> = ({
  threshold,
  targetBlockCount,
  onThresholdChange,
  onTargetChange,
}) => {
  return (
    <div className="border-b border-l-4 border-gray-200 border-l-indigo-500/40 bg-indigo-50/50 p-6">
      <H3 className="mb-4">Define Your Goals</H3>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Selectors */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Block Length Selector */}
          <div className="flex items-center gap-3">
            <Label className="whitespace-nowrap">
              What counts as deep work?
            </Label>
            <ToggleGroup
              type="single"
              value={threshold.toString()}
              onValueChange={(value) => {
                if (value)
                  onThresholdChange(parseInt(value) as DeepWorkThreshold)
              }}
              className="rounded-sm bg-gray-100 p-1"
            >
              {[30, 45, 60].map((t) => (
                <ToggleGroupItem
                  key={t}
                  value={t.toString()}
                  className="h-auto rounded-sm px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-200/50 hover:text-gray-900 data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-black/5 data-[state=on]:hover:bg-black data-[state=on]:hover:text-white"
                >
                  {t}m
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Daily Target Selector */}
          <div className="flex items-center gap-3">
            <Label className="whitespace-nowrap">
              How many blocks do you need?
            </Label>
            <ToggleGroup
              type="single"
              value={targetBlockCount.toString()}
              onValueChange={(value) => {
                if (value) onTargetChange(parseInt(value))
              }}
              className="rounded-sm bg-gray-100 p-1"
            >
              {[1, 2, 3].map((n) => (
                <ToggleGroupItem
                  key={n}
                  value={n.toString()}
                  className="h-auto rounded-sm px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-200/50 hover:text-gray-900 data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-black/5 data-[state=on]:hover:bg-black data-[state=on]:hover:text-white"
                >
                  {n}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Goal Context */}
        <div className="flex-1 md:max-w-xs">
          <Card className="rounded-sm border border-gray-200 bg-gray-100 p-4 shadow-none">
            <div className="space-y-2">
              <BodySmall className="text-gray-600">
                <span className="font-medium">Deep work block:</span> A
                continuous period of focused work without interruptions.
              </BodySmall>
              <BodySmall className="text-gray-600">
                <span className="font-medium">Daily target:</span> The number of{' '}
                {threshold}-min blocks you need to have a successful day.
              </BodySmall>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
