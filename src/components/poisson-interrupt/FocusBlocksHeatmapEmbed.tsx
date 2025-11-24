import { useState, useMemo } from 'react'
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

interface FocusBlocksHeatmapEmbedProps {
  threshold?: 30 | 45 | 60
  showThresholdControl?: boolean
  highlightedCells?: Array<{ lambda: number; delta: number; color?: string }>
}

/**
 * Standalone embeddable heatmap component for blog posts.
 * Pass threshold as prop to control the focus block threshold.
 *
 * Example usage in Astro MDX:
 * ```mdx
 * <FocusBlocksHeatmapEmbed
 *   threshold={45}
 *   showThresholdControl={true}
 *   client:load
 * />
 * ```
 */
export function FocusBlocksHeatmapEmbed({
  threshold: initialThreshold = 45,
  showThresholdControl = true,
  highlightedCells = [],
}: FocusBlocksHeatmapEmbedProps) {
  const [threshold, setThreshold] = useState(initialThreshold)
  const [hovered, setHovered] = useState<HeatmapCell | null>(null)

  // Helper function to find highlighted cell (returns cell with color if found)
  const findHighlightedCell = (lambda: number, delta: number) => {
    return highlightedCells.find(
      (cell) =>
        Math.abs(cell.lambda - lambda) < 0.01 &&
        Math.abs(cell.delta - delta) < 0.01,
    )
  }

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

  const maxValue = grid._max || 1

  const cellSize = 34
  const paddingLeft = 60
  const paddingBottom = 40
  const paddingTop = 20
  const paddingRight = 20

  const svgWidth = paddingLeft + paddingRight + lambdaValues.length * cellSize
  const svgHeight = paddingTop + paddingBottom + deltaValues.length * cellSize

  const toggleItemClassName =
    'data-[state=on]:border-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white dark:data-[state=on]:border-gray-100 dark:data-[state=on]:bg-gray-100 dark:data-[state=on]:text-gray-900'

  return (
    <div className="flex w-full flex-col items-center gap-2">
      {showThresholdControl && (
        <ToggleGroup
          type="single"
          value={threshold.toString()}
          onValueChange={(value) => {
            if (value) setThreshold(parseInt(value, 10) as 30 | 45 | 60)
          }}
          className="gap-2"
        >
          <ToggleGroupItem value="30" className={toggleItemClassName}>
            ≥ 30 min
          </ToggleGroupItem>
          <ToggleGroupItem value="45" className={toggleItemClassName}>
            ≥ 45 min
          </ToggleGroupItem>
          <ToggleGroupItem value="60" className={toggleItemClassName}>
            ≥ 60 min
          </ToggleGroupItem>
        </ToggleGroup>
      )}

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
            fontSize="12"
            fill="#555"
          >
            Interruptions per hour (λ)
          </text>

          {/* Y-axis label */}
          <text
            x={15}
            y={paddingTop + (deltaValues.length * cellSize) / 2}
            textAnchor="middle"
            fontSize="12"
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
                fontSize="11"
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
                fontSize="11"
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
              const highlightedCell = findHighlightedCell(cell.lambda, cell.delta)
              const isHighlighted = !!highlightedCell
              const textValue = cell.expectedBlocks.toFixed(1)
              // Determine text color based on background lightness
              const t =
                maxValue === 0
                  ? 0
                  : Math.min(cell.expectedBlocks, maxValue) / maxValue
              const textColor = t > 0.5 ? '#fff' : '#333'

              // Determine stroke color and width based on state
              const strokeColor = isHighlighted
                ? highlightedCell.color || '#ef4444'
                : isHovered
                  ? '#222'
                  : 'rgba(0,0,0,0.06)'
              const strokeWidth = isHighlighted ? 2.5 : isHovered ? 1.4 : 0.5

              return (
                <g key={`c-${rowIdx}-${colIdx}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize - 1}
                    height={cellSize - 1}
                    fill={color}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    onMouseEnter={() => setHovered(cell)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer transition-all"
                  />
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 3}
                    textAnchor="middle"
                    fontSize="10"
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
    </div>
  )
}
