import React, { useState, useRef, useMemo, memo, useCallback } from "react";
import type { DayStats } from "@/components/poisson-interrupt/simulation";
import {
  SVG_WIDTH,
  SVG_HEIGHT,
  GRID_COLS,
  COL_WIDTH,
  GRID_MARGIN,
  ROW_HEIGHT,
  DAY_WIDTH,
  DAY_HEIGHT,
  DAY_MINUTES,
} from "@/components/poisson-interrupt/constants";
import { getBlockColor } from "@/components/poisson-interrupt/utils";
import { LabelSmall } from "./Typography";

interface TooltipData {
  x: number;
  y: number;
  day: DayStats;
}

interface DayCellProps {
  day: DayStats;
  index: number;
  x: number;
  y: number;
  threshold: number;
  targetBlockCount: number;
  onHover: (e: React.MouseEvent, day: DayStats) => void;
  onSelect: (index: number) => void;
}

const DayCell = memo(
  ({
    day,
    index,
    x,
    y,
    threshold,
    targetBlockCount,
    onHover,
    onSelect,
  }: DayCellProps) => {
    // Calculate derived state
    const { hasGoodBlock, gaps } = useMemo(() => {
      const qualifyingBlocksCapacity = day.blocks.reduce(
        (acc, b) => acc + Math.floor(b.duration / threshold),
        0
      );
      const hasGoodBlock = qualifyingBlocksCapacity >= targetBlockCount;

      const gaps = [];
      let currentPos = 0;
      day.blocks.forEach((b) => {
        if (b.start > currentPos) {
          gaps.push({ start: currentPos, end: b.start });
        }
        currentPos = b.end;
      });
      if (currentPos < DAY_MINUTES) {
        gaps.push({ start: currentPos, end: DAY_MINUTES });
      }
      return { hasGoodBlock, gaps };
    }, [day, threshold, targetBlockCount]);

    return (
      <g
        transform={`translate(${x}, ${y})`}
        onMouseMove={(e) => onHover(e, day)}
        onClick={() => onSelect(index)}
        className={`cursor-pointer transition-all duration-300 hover:opacity-100 group ${
          !hasGoodBlock ? "day-bad opacity-100" : "opacity-100"
        }`}
      >
        {/* Shadow for good days */}
        {hasGoodBlock && (
          <rect
            x={-2}
            y={-2}
            width={DAY_WIDTH + 4}
            height={DAY_HEIGHT + 4}
            fill="transparent"
            className="drop-shadow-md"
          />
        )}

        {/* Base day container (Background) */}
        <rect
          width={DAY_WIDTH}
          height={DAY_HEIGHT}
          rx={2}
          fill={hasGoodBlock ? "var(--svg-blue-50)" : "var(--svg-slate-50)"}
          className="transition-all"
        />

        {/* Recovery / Interruption Gaps */}
        {gaps.map((gap, gIdx) => {
          const gx = (gap.start / 480) * DAY_WIDTH;
          const gw = ((gap.end - gap.start) / 480) * DAY_WIDTH;
          return (
            <rect
              key={`gap-${gIdx}`}
              x={gx}
              y={hasGoodBlock ? 3 : 0}
              width={Math.max(gw, 0)}
              height={hasGoodBlock ? DAY_HEIGHT - 6 : DAY_HEIGHT}
              fill="url(#recoveryPattern)"
              opacity={0.5}
              rx={1}
            />
          );
        })}

        {/* Focus Blocks */}
        {day.blocks.map((block, bIdx) => {
          const blockX = (block.start / 480) * DAY_WIDTH;
          const blockW = (block.duration / 480) * DAY_WIDTH;

          return (
            <rect
              key={bIdx}
              x={blockX}
              y={hasGoodBlock ? 3 : 0}
              width={Math.max(blockW - 1, 0)} // -1 for tiny visual gap
              height={hasGoodBlock ? DAY_HEIGHT - 6 : DAY_HEIGHT}
              fill={getBlockColor(block.duration)}
              rx={1}
              className="hover:brightness-110"
            />
          );
        })}

        {/* Border overlay */}
        <rect
          width={DAY_WIDTH}
          height={DAY_HEIGHT}
          rx={2}
          fill="none"
          stroke={
            hasGoodBlock ? "var(--svg-indigo-500)" : "var(--svg-slate-300)"
          }
          strokeWidth={2}
          className="transition-all pointer-events-none"
        />
      </g>
    );
  }
);

DayCell.displayName = "DayCell";

interface DaysGridProps {
  daysData: DayStats[];
  threshold: number;
  targetBlockCount: number;
  onSelectDay: (index: number) => void;
  lambda?: number;
  delta?: number;
}

export const DaysGrid: React.FC<DaysGridProps> = ({
  daysData,
  threshold,
  targetBlockCount,
  onSelectDay,
  lambda,
  delta,
}) => {
  const [hoveredDay, setHoveredDay] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleDayHover = useCallback((e: React.MouseEvent, day: DayStats) => {
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setHoveredDay({ x, y, day });
    }
  }, []);

  return (
    <div
      ref={gridRef}
      className="w-full max-w-[800px] relative days-grid-container"
    >
      {/* Grid Legend */}
      <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-500"></span>
          <LabelSmall>45+ min</LabelSmall>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
          <LabelSmall>30-45 min</LabelSmall>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
          <LabelSmall>15-30 min</LabelSmall>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>
          <LabelSmall>&lt;15 min</LabelSmall>
        </span>
        {lambda !== undefined && (
          <span className="flex items-center gap-1.5">
            <LabelSmall>λ = {lambda}/hr</LabelSmall>
          </span>
        )}
        {delta !== undefined && (
          <span className="flex items-center gap-1.5">
            <LabelSmall>δ = {delta}m</LabelSmall>
          </span>
        )}
      </div>
      {/* Styles for performant hover effects */}
      <style>{`
          .days-grid-container .day-bad {
            opacity: 0.4;
            filter: grayscale(0.5);
          }
          .days-grid-container .day-bad:hover {
            opacity: 1;
            filter: none;
          }
        `}</style>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-auto drop-shadow-sm animate-in fade-in zoom-in-95 duration-300"
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHoveredDay(null)}
      >
        <defs>
          <pattern
            id="recoveryPattern"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect
              width="1"
              height="4"
              transform="translate(0,0)"
              fill="var(--svg-slate-300)"
            />
          </pattern>
        </defs>
        {daysData.map((day, i) => {
          const row = Math.floor(i / GRID_COLS);
          const col = i % GRID_COLS;
          const x = col * COL_WIDTH + GRID_MARGIN; // Add margin offset
          const y = row * ROW_HEIGHT + GRID_MARGIN; // Add margin offset

          return (
            <DayCell
              key={day.dayIndex}
              day={day}
              index={i}
              x={x}
              y={y}
              threshold={threshold}
              targetBlockCount={targetBlockCount}
              onHover={handleDayHover}
              onSelect={onSelectDay}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="absolute z-50 bg-gray-900 text-white p-3 rounded-sm shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px]"
          style={{ left: hoveredDay.x, top: hoveredDay.y }}
        >
          <div className="text-xs font-bold mb-1 text-gray-500 uppercase tracking-wider">
            Day #{hoveredDay.day.dayIndex + 1}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span>Total Focus:</span>
              <span className="font-mono font-bold">
                {Math.floor(hoveredDay.day.totalFocus / 60)}h{" "}
                {Math.round(hoveredDay.day.totalFocus % 60)}m
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Interruptions:</span>
              <span className="font-mono font-bold text-red-300">
                {hoveredDay.day.interruptions}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Longest Block:</span>
              <span
                className={`font-mono font-bold ${hoveredDay.day.longestBlock >= threshold ? "text-teal-400" : "text-amber-300"}`}
              >
                {Math.round(hoveredDay.day.longestBlock)}m
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
