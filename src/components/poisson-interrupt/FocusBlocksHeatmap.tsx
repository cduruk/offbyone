import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { simulateDays } from '@/components/poisson-interrupt/simulation'

const LAMBDA_MIN = 0
const LAMBDA_MAX = 4
const LAMBDA_STEP = 0.5
const DELTA_MIN = 5
const DELTA_MAX = 30
const DELTA_STEP = 5

// Generate lambda values
const lambdaValues: number[] = []
for (let v = LAMBDA_MIN; v <= LAMBDA_MAX + 1e-6; v += LAMBDA_STEP) {
  lambdaValues.push(parseFloat(v.toFixed(2)))
}

// Generate delta values
const deltaValues: number[] = []
for (let v = DELTA_MIN; v <= DELTA_MAX + 1e-6; v += DELTA_STEP) {
  deltaValues.push(parseFloat(v.toFixed(2)))
}

// Uses the main app's simulation logic for consistency
function estimateExpectedBlocks(
  lambdaPerHour: number,
  deltaMinutes: number,
  thresholdMinutes: number,
  simulations: number,
): number {
  let total = 0
  for (let i = 0; i < simulations; i++) {
    // Use different seed for each simulation to get Monte Carlo estimate
    const seed = Math.floor(Math.random() * 1000000) + i
    const [day] = simulateDays(1, lambdaPerHour, deltaMinutes, seed)

    // Calculate capacity based on threshold (same as main app)
    const capacity = day.blocks.reduce(
      (acc, b) => acc + Math.floor(b.duration / thresholdMinutes),
      0,
    )
    total += capacity
  }
  return total / simulations
}

function colorForValue(value: number, maxValue: number): string {
  const clamped = Math.max(0, Math.min(value, maxValue))
  const t = maxValue === 0 ? 0 : clamped / maxValue
  const lightness = 92 - t * 57
  return `hsl(265, 70%, ${lightness}%)`
}

interface HeatmapCell {
  lambda: number
  delta: number
  expectedBlocks: number
}

type HeatmapGrid = HeatmapCell[][] & { _max?: number }

export function FocusBlocksHeatmap() {
  const [threshold, setThreshold] = useState(45)
  const [hovered, setHovered] = useState<HeatmapCell | null>(null)

  const grid = useMemo<HeatmapGrid>(() => {
    const simsPerCell = 60
    const rows: HeatmapCell[][] = []
    let globalMax = 0

    // Reverse both axes: delta forward (low to high), lambda reverse (high to low)
    for (let di = 0; di < deltaValues.length; di++) {
      const row: HeatmapCell[] = []
      for (let li = lambdaValues.length - 1; li >= 0; li--) {
        const lambda = lambdaValues[li]
        const delta = deltaValues[di]
        const expected = estimateExpectedBlocks(
          lambda,
          delta,
          threshold,
          simsPerCell,
        )
        row.push({ lambda, delta, expectedBlocks: expected })
        if (expected > globalMax) globalMax = expected
      }
      rows.push(row)
    }
    const gridWithMax = rows as HeatmapGrid
    gridWithMax._max = globalMax
    return gridWithMax
  }, [threshold])

  // SSR guard
  if (typeof window === 'undefined') {
    return null
  }

  const maxValue = grid._max || 1

  const cellSize = 26
  const paddingLeft = 60
  const paddingBottom = 40
  const paddingTop = 20
  const paddingRight = 20

  const svgWidth = paddingLeft + paddingRight + lambdaValues.length * cellSize
  const svgHeight = paddingTop + paddingBottom + deltaValues.length * cellSize

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Focus Blocks Heatmap</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              This playground simulates an 8-hour workday as a Poisson process
              of interruptions. Each cell in the heatmap shows the expected
              number of uninterrupted focus blocks (at least N minutes long)
              given an interruption rate (λ) and a recovery time (Δ). Darker
              cells mean more usable focus blocks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-start gap-4">
              <div>
                <div className="mb-2 text-sm font-semibold">
                  Focus block threshold
                </div>
                <ToggleGroup
                  type="single"
                  value={threshold.toString()}
                  onValueChange={(value) => {
                    if (value) setThreshold(parseInt(value, 10))
                  }}
                >
                  <ToggleGroupItem value="30">≥ 30 min</ToggleGroupItem>
                  <ToggleGroupItem value="45">≥ 45 min</ToggleGroupItem>
                  <ToggleGroupItem value="60">≥ 60 min</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="text-muted-foreground max-w-md text-sm leading-relaxed">
                Each cell shows the expected block capacity (how many{' '}
                <strong className="text-foreground">
                  {threshold}-minute blocks
                </strong>{' '}
                can fit) in an 8-hour day, for a given interruption rate (λ) and
                recovery time (Δ). Darker means higher capacity.
              </div>
            </div>

            <div className="overflow-x-auto">
              <svg
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="h-auto max-w-full"
              >
                {/* X-axis label */}
                <text
                  x={paddingLeft + (lambdaValues.length * cellSize) / 2}
                  y={svgHeight - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#555"
                >
                  Interruptions per hour (λ)
                </text>

                {/* Y-axis label */}
                <text
                  x={15}
                  y={paddingTop + (deltaValues.length * cellSize) / 2}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#555"
                  transform={`rotate(-90 15 ${
                    paddingTop + (deltaValues.length * cellSize) / 2
                  })`}
                >
                  Recovery time Δ (minutes)
                </text>

                {/* X-axis tick labels - reversed to match data order */}
                {[...lambdaValues].reverse().map((lambda, idx) => {
                  const x = paddingLeft + idx * cellSize + cellSize / 2
                  return (
                    <text
                      key={`lx-${idx}`}
                      x={x}
                      y={svgHeight - paddingBottom + 12}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#777"
                    >
                      {lambda.toFixed(1)}
                    </text>
                  )
                })}

                {/* Y-axis tick labels */}
                {deltaValues.map((delta, idx) => {
                  const y = paddingTop + idx * cellSize + cellSize / 2 + 3
                  return (
                    <text
                      key={`dy-${idx}`}
                      x={paddingLeft - 6}
                      y={y}
                      textAnchor="end"
                      fontSize="9"
                      fill="#777"
                    >
                      {delta.toFixed(0)}
                    </text>
                  )
                })}

                {/* Heatmap cells */}
                {grid.map((row, rowIdx) =>
                  row.map((cell, colIdx) => {
                    const x = paddingLeft + colIdx * cellSize
                    const y = paddingTop + rowIdx * cellSize
                    const color = colorForValue(cell.expectedBlocks, maxValue)
                    const isHovered =
                      hovered &&
                      hovered.lambda === cell.lambda &&
                      hovered.delta === cell.delta
                    const textValue = cell.expectedBlocks.toFixed(1)
                    // Determine text color based on background lightness
                    const t =
                      maxValue === 0
                        ? 0
                        : Math.min(cell.expectedBlocks, maxValue) / maxValue
                    const textColor = t > 0.5 ? '#fff' : '#333'

                    return (
                      <g key={`c-${rowIdx}-${colIdx}`}>
                        <rect
                          x={x}
                          y={y}
                          width={cellSize - 1}
                          height={cellSize - 1}
                          fill={color}
                          stroke={isHovered ? '#222' : 'rgba(0,0,0,0.06)'}
                          strokeWidth={isHovered ? 1.4 : 0.5}
                          onMouseEnter={() => setHovered(cell)}
                          onMouseLeave={() => setHovered(null)}
                          className="cursor-pointer transition-all"
                        />
                        <text
                          x={x + cellSize / 2}
                          y={y + cellSize / 2 + 3}
                          textAnchor="middle"
                          fontSize="8"
                          fill={textColor}
                          fontWeight="500"
                          pointerEvents="none"
                        >
                          {textValue}
                        </text>
                      </g>
                    )
                  }),
                )}
              </svg>
            </div>

            <div className="flex min-h-[3rem] items-center rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              {hovered ? (
                <div className="space-y-1">
                  <div>
                    <strong>
                      λ = {hovered.lambda.toFixed(2)} interrupts/hour, Δ ={' '}
                      {hovered.delta.toFixed(1)} min
                    </strong>
                  </div>
                  <div>
                    Expected {threshold}-min block capacity per day:{' '}
                    <strong>{hovered.expectedBlocks.toFixed(1)}</strong>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Hover over a cell to see the expected block capacity for that
                  λ and Δ.
                </span>
              )}
            </div>

            <div className="text-muted-foreground border-t pt-2 text-xs">
              Tip: Block capacity shows how many {threshold}-minute work periods
              fit in a day. Watch how it decreases as interruptions (λ) and
              recovery time (Δ) increase. Try different thresholds to see the
              impact.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
