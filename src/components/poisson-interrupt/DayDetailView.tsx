import React from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DayStats } from '@/components/poisson-interrupt/simulation'
import {
  SVG_WIDTH,
  DAY_MINUTES,
} from '@/components/poisson-interrupt/constants'
import { formatTime, getBlockColor } from '@/components/poisson-interrupt/utils'
import { LabelSmall, AxisLabel, BodySmall, MonoHighlight } from './Typography'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface DayDetailViewProps {
  day: DayStats
  threshold: number
  onBack: () => void
  onNext: () => void
  onPrev: () => void
  hasNext: boolean
  hasPrev: boolean
  lambda?: number
  delta?: number
  showNavigation?: boolean
  showBackButton?: boolean
}

const ChartLegend = ({
  lambda,
  delta,
}: {
  lambda?: number
  delta?: number
}) => (
  <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 opacity-80 sm:pt-0">
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm bg-teal-500 shadow-sm"></span>
      <LabelSmall>Focus</LabelSmall>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="absolute inset-y-0 w-[2px] bg-red-500/60"></span>
        <span className="absolute h-1.5 w-1.5 rounded-sm bg-red-500"></span>
      </span>
      <LabelSmall>Interruption</LabelSmall>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="relative h-2.5 w-2.5 overflow-hidden rounded-sm border border-gray-300 bg-gray-200">
        {/* Simulated hatch pattern via CSS gradient */}
        <span
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(45deg, var(--svg-slate-500) 25%, transparent 25%, transparent 50%, var(--svg-slate-500) 50%, var(--svg-slate-500) 75%, transparent 75%, transparent)',
            backgroundSize: '3px 3px',
          }}
        ></span>
      </span>
      <LabelSmall>Recovery Penalty</LabelSmall>
    </div>
    {lambda !== undefined && (
      <div className="flex items-center gap-1.5">
        <LabelSmall>λ = {lambda}/hr</LabelSmall>
      </div>
    )}
    {delta !== undefined && (
      <div className="flex items-center gap-1.5">
        <LabelSmall>δ = {delta}m</LabelSmall>
      </div>
    )}
  </div>
)

export const DayDetailView: React.FC<DayDetailViewProps> = ({
  day,
  threshold,
  onBack,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  lambda,
  delta,
  showNavigation = true,
  showBackButton,
}) => {
  // Default showBackButton to showNavigation if not explicitly set
  const displayBackButton = showBackButton ?? showNavigation
  // Scales for detail view
  const VIEW_WIDTH = SVG_WIDTH
  const VIEW_HEIGHT = 200
  const MARGIN_X = 16
  const desktopContainerStyle = { width: '100%' }
  const TIMELINE_Y = 60
  const BAR_HEIGHT = 60
  const SCALE_X = (VIEW_WIDTH - MARGIN_X * 2) / DAY_MINUTES

  // Mobile Scales (Vertical)
  const MOBILE_WIDTH = 320
  const MOBILE_HEIGHT = 600
  const MOBILE_MARGIN_Y = 40
  const SCALE_Y = (MOBILE_HEIGHT - MOBILE_MARGIN_Y * 2) / DAY_MINUTES
  const MOBILE_TRACK_WIDTH = 140

  // Gaps calculation for Detail View
  const gaps = []
  let currentPos = 0
  day.blocks.forEach((b) => {
    if (b.start > currentPos) {
      gaps.push({ start: currentPos, end: b.start })
    }
    currentPos = b.end
  })
  if (currentPos < DAY_MINUTES) {
    gaps.push({ start: currentPos, end: DAY_MINUTES })
  }

  // Calculate capacity based on current threshold
  const capacity = day.blocks.reduce(
    (acc, b) => acc + Math.floor(b.duration / threshold),
    0,
  )

  return (
    <div className="animate-in fade-in zoom-in-95 flex w-full flex-col items-center duration-300">
      {/* Header Section */}
      <div className="flex w-full flex-col items-center">
        {/* Desktop View */}
        <div
          className="hidden w-full flex-col items-center gap-3 sm:flex"
          style={desktopContainerStyle}
        >
          {displayBackButton && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex h-auto items-center gap-1.5 self-start px-3 py-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft size={14} />
              <span>Back to Grid</span>
            </Button>
          )}

          <div className="text-center">
            {showNavigation && (
              <div className="mb-3 flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="h-auto w-auto p-1 text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-20"
                  title="Previous Day"
                >
                  <ChevronLeft size={20} />
                </Button>
                <span className="text-lg font-semibold text-gray-900">
                  Day #{day.dayIndex + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNext}
                  disabled={!hasNext}
                  className="h-auto w-auto p-1 text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-20"
                  title="Next Day"
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            )}
            <ChartLegend lambda={lambda} delta={delta} />
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex w-full flex-col gap-3 px-4 sm:hidden">
          {displayBackButton && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex h-auto items-center gap-1 self-start px-2 py-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </Button>
          )}

          <div className="flex flex-col items-center gap-3">
            {showNavigation && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="h-auto w-auto p-1.5 text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-20"
                  aria-label="Previous Day"
                >
                  <ChevronLeft size={22} />
                </Button>
                <span className="text-base font-semibold text-gray-900">
                  Day #{day.dayIndex + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNext}
                  disabled={!hasNext}
                  className="h-auto w-auto p-1.5 text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-20"
                  aria-label="Next Day"
                >
                  <ChevronRight size={22} />
                </Button>
              </div>
            )}
            <ChartLegend lambda={lambda} delta={delta} />
          </div>
        </div>
      </div>

      {/* --- Desktop View (Horizontal) --- */}
      <div className="hidden w-full sm:block" style={desktopContainerStyle}>
        <svg
          width="100%"
          height={VIEW_HEIGHT}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="h-auto max-w-full"
        >
          {/* Defs */}
          <defs>
            <pattern
              id="recoveryPatternLg"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect
                width="2"
                height="8"
                transform="translate(0,0)"
                fill="var(--svg-slate-300)"
              />
            </pattern>
          </defs>

          {/* Timeline Axis */}
          <line
            x1={MARGIN_X}
            y1={TIMELINE_Y + BAR_HEIGHT + 30}
            x2={VIEW_WIDTH - MARGIN_X}
            y2={TIMELINE_Y + BAR_HEIGHT + 30}
            stroke="var(--svg-slate-200)"
            strokeWidth="2"
          />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((hr) => {
            const x = MARGIN_X + hr * 60 * SCALE_X
            return (
              <g
                key={hr}
                transform={`translate(${x}, ${TIMELINE_Y + BAR_HEIGHT + 40})`}
              >
                <line
                  y1="-10"
                  y2="0"
                  stroke="var(--svg-slate-300)"
                  strokeWidth="2"
                />
                <AxisLabel textAnchor="middle" y="20">
                  {hr}h
                </AxisLabel>
              </g>
            )
          })}

          {/* Background Track */}
          <rect
            x={MARGIN_X}
            y={TIMELINE_Y}
            width={VIEW_WIDTH - MARGIN_X * 2}
            height={BAR_HEIGHT}
            fill="var(--svg-slate-100)"
            rx={2}
          />

          {/* Gaps (Recovery) */}
          {gaps.map((gap, i) => {
            const duration = gap.end - gap.start
            const width = duration * SCALE_X
            const x = MARGIN_X + gap.start * SCALE_X

            const cascadeCount = day.interruptionTimes.filter(
              (t) => t >= gap.start && t < gap.end,
            ).length
            const tooltip =
              cascadeCount > 1
                ? `Recovery Penalty: ${Math.round(duration)}m (Cascaded: ${cascadeCount} interruptions)`
                : `Recovery Penalty: ${Math.round(duration)}m (Cannot focus)`

            return (
              <g key={`gap-${i}`}>
                <rect
                  x={x}
                  y={TIMELINE_Y}
                  width={width}
                  height={BAR_HEIGHT}
                  fill="url(#recoveryPatternLg)"
                  opacity={0.5}
                >
                  <title>{tooltip}</title>
                </rect>
                {duration > 5 && (
                  <text
                    x={x + width / 2}
                    y={TIMELINE_Y + BAR_HEIGHT / 2 + 5}
                    textAnchor="middle"
                    className="pointer-events-none fill-gray-600 text-xs font-bold italic [text-shadow:0_0_2px_rgba(255,255,255,0.9)] dark:fill-gray-100 dark:[text-shadow:0_0_2px_rgba(0,0,0,0.9)]"
                  >
                    {`${Math.round(duration)}m`}
                  </text>
                )}
              </g>
            )
          })}

          {/* Interruption Markers (Red Lines) for ALL interruptions */}
          {day.interruptionTimes.map((t, i) => (
            <g
              key={`int-${i}`}
              transform={`translate(${MARGIN_X + t * SCALE_X}, ${TIMELINE_Y})`}
            >
              <line
                y1="-10"
                y2={BAR_HEIGHT + 10}
                stroke="var(--svg-red-500)"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <circle cy="-14" r="4" fill="var(--svg-red-500)" />
            </g>
          ))}

          {/* Focus Blocks */}
          {day.blocks.map((block, i) => {
            const width = block.duration * SCALE_X
            return (
              <g
                key={`block-${i}`}
                transform={`translate(${MARGIN_X + block.start * SCALE_X}, ${TIMELINE_Y})`}
              >
                <rect
                  width={Math.max(width - 1, 0)}
                  height={BAR_HEIGHT}
                  fill={getBlockColor(block.duration)}
                  rx={2}
                  stroke="white"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                >
                  <title>{`Focus Block: ${Math.round(block.duration)}m`}</title>
                </rect>
                {width > 30 && (
                  <text
                    x={width / 2}
                    y={BAR_HEIGHT / 2 + 5}
                    textAnchor="middle"
                    className="pointer-events-none fill-white text-sm font-bold"
                    style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.2)' }}
                  >
                    {`${Math.round(block.duration)}m`}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* --- Mobile View (Vertical) --- */}
      <svg
        width="100%"
        height={MOBILE_HEIGHT}
        viewBox={`0 0 ${MOBILE_WIDTH} ${MOBILE_HEIGHT}`}
        className="mx-auto block h-auto w-full max-w-[320px] sm:hidden"
      >
        <defs>
          <pattern
            id="recoveryPatternVert"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect
              width="2"
              height="8"
              transform="translate(0,0)"
              fill="var(--svg-slate-300)"
            />
          </pattern>
        </defs>

        {/* Vertical Axis (Hours) */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((hr) => {
          const y = MOBILE_MARGIN_Y + hr * 60 * SCALE_Y
          return (
            <g key={`v-hr-${hr}`} transform={`translate(40, ${y})`}>
              <line
                x1="0"
                x2={MOBILE_WIDTH}
                stroke="var(--svg-slate-200)"
                strokeWidth="1"
                strokeDasharray={hr === 0 || hr === 8 ? '' : '2 2'}
              />
              <AxisLabel textAnchor="end" dy="4">
                {hr + 9} {hr + 9 >= 12 ? 'pm' : 'am'}
              </AxisLabel>
            </g>
          )
        })}

        {/* Background Track */}
        <rect
          x={70}
          y={MOBILE_MARGIN_Y}
          width={MOBILE_TRACK_WIDTH}
          height={MOBILE_HEIGHT - MOBILE_MARGIN_Y * 2}
          fill="var(--svg-slate-100)"
          rx={2}
        />

        {/* Gaps (Recovery) */}
        {gaps.map((gap, i) => {
          const duration = gap.end - gap.start
          const height = duration * SCALE_Y
          const y = MOBILE_MARGIN_Y + gap.start * SCALE_Y

          // Count cascades for tooltip
          const cascadeCount = day.interruptionTimes.filter(
            (t) => t >= gap.start && t < gap.end,
          ).length
          const tooltip =
            cascadeCount > 1
              ? `Recovery Penalty: ${Math.round(duration)}m (Cascaded: ${cascadeCount} interruptions)`
              : `Recovery Penalty: ${Math.round(duration)}m (Cannot focus)`

          return (
            <g key={`v-gap-${i}`}>
              <rect
                x={70}
                y={y}
                width={MOBILE_TRACK_WIDTH}
                height={Math.max(height, 1)}
                fill="url(#recoveryPatternVert)"
                opacity={0.6}
              >
                <title>{tooltip}</title>
              </rect>
              {duration > 5 && (
                <text
                  x={70 + MOBILE_TRACK_WIDTH / 2}
                  y={y + height / 2 + 3}
                  textAnchor="middle"
                  className="fill-gray-600 text-[10px] font-bold italic [text-shadow:0_0_2px_rgba(255,255,255,0.9)] dark:fill-gray-100 dark:[text-shadow:0_0_2px_rgba(0,0,0,0.9)]"
                >
                  {`${Math.round(duration)}m gap`}
                </text>
              )}
            </g>
          )
        })}

        {/* Interruption Markers for ALL interruptions */}
        {day.interruptionTimes.map((t, i) => {
          const y = MOBILE_MARGIN_Y + t * SCALE_Y
          return (
            <g key={`v-int-${i}`} transform={`translate(60, ${y})`}>
              <line
                x1="0"
                x2={MOBILE_TRACK_WIDTH + 20}
                stroke="var(--svg-red-500)"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <circle cx="0" cy="0" r="4" fill="var(--svg-red-500)" />
            </g>
          )
        })}

        {/* Focus Blocks */}
        {day.blocks.map((block, i) => {
          const height = block.duration * SCALE_Y
          const y = MOBILE_MARGIN_Y + block.start * SCALE_Y
          return (
            <g key={`v-block-${i}`}>
              <rect
                x={70}
                y={y}
                width={MOBILE_TRACK_WIDTH}
                height={Math.max(height - 1, 0)}
                fill={getBlockColor(block.duration)}
                rx={2}
                stroke="white"
                strokeWidth="2"
              />
              {block.duration > 20 ? (
                <text
                  x={70 + MOBILE_TRACK_WIDTH / 2}
                  y={y + height / 2 + 4}
                  textAnchor="middle"
                  className="fill-white text-sm font-bold"
                  style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.2)' }}
                >
                  {`${Math.round(block.duration)}m`}
                </text>
              ) : null}

              {/* Side Labels for significant blocks */}
              {block.duration > 30 && (
                <g
                  transform={`translate(${70 + MOBILE_TRACK_WIDTH + 10}, ${y + height / 2})`}
                >
                  <text className="fill-gray-500 font-mono text-[10px]" dy="-6">
                    {formatTime(block.start)}
                  </text>
                  <text className="fill-gray-500 font-mono text-[10px]" dy="6">
                    {formatTime(block.end)}
                  </text>
                  <line
                    x1="-5"
                    y1="-12"
                    x2="-5"
                    y2="12"
                    stroke="var(--svg-slate-300)"
                    strokeWidth="1"
                  />
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* Consolidated Analysis Section - Styled like Impact Analysis */}
      <div className="mt-4 flex w-full justify-center">
        <div className="w-full px-4 sm:px-0" style={desktopContainerStyle}>
          <Card className="rounded-sm border border-gray-200 bg-gray-100 p-4 shadow-none">
            <BodySmall className="leading-relaxed">
              <p>
                You managed{' '}
                <span className="font-bold text-gray-900">
                  {Math.floor(day.totalFocus / 60)}h{' '}
                  {Math.round(day.totalFocus % 60)}m
                </span>{' '}
                of focus time and{' '}
                <span className="font-bold text-gray-900">{capacity}</span> deep
                work blocks (&gt;<MonoHighlight>{threshold}m</MonoHighlight>),
                though <MonoHighlight>{day.interruptions}</MonoHighlight>{' '}
                interruptions cost you{' '}
                <span className="font-bold text-gray-900">
                  {Math.round(DAY_MINUTES - day.totalFocus)} min
                </span>{' '}
                of potential productivity, capping your longest uninterrupted
                stretch at{' '}
                <span className="font-bold text-gray-900">
                  {Math.round(day.longestBlock)} min
                </span>
                .
              </p>
            </BodySmall>
          </Card>
        </div>
      </div>
    </div>
  )
}
