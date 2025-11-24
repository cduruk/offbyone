import React from "react";
import { RefreshCw } from "lucide-react";
import type { DeepWorkThreshold } from "@/components/poisson-interrupt/constants";
import { H3 } from "./Typography";
import { Button } from "@/components/ui/button";

interface SimulationStatsProps {
  goodDaysCount: number;
  targetBlockCount: number;
  threshold: DeepWorkThreshold;
  onReseed: () => void;
}

export const SimulationStats: React.FC<SimulationStatsProps> = ({
  goodDaysCount,
  targetBlockCount,
  threshold,
  onReseed,
}) => {
  return (
    <div className="p-6 bg-teal-50/50 border-b border-gray-200 border-l-4 border-l-teal-500/40">
      <div className="flex items-center justify-between mb-4">
        <H3>Your Likelihood of Success</H3>
        <Button
          variant="ghost"
          onClick={onReseed}
          className="px-3 py-1.5 h-auto text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw size={14} />
          <span>Re-run</span>
        </Button>
      </div>

      <div className="flex items-baseline text-gray-900">
        <span className="text-4xl font-bold mr-3 text-gray-900">
          {goodDaysCount}%
        </span>
        <span className="text-sm font-medium">
          likelihood of achieving{" "}
          {targetBlockCount > 1 ? `${targetBlockCount} blocks` : "a block"} &ge;{" "}
          {threshold} min on any given day
        </span>
      </div>
    </div>
  );
};
