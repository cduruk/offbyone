import React from "react";
import type { DeepWorkThreshold } from "@/components/poisson-interrupt/constants";
import { H3, Label, BodySmall } from "./Typography";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface GoalDefinitionProps {
  threshold: DeepWorkThreshold;
  targetBlockCount: number;
  onThresholdChange: (val: DeepWorkThreshold) => void;
  onTargetChange: (val: number) => void;
}

export const GoalDefinition: React.FC<GoalDefinitionProps> = ({
  threshold,
  targetBlockCount,
  onThresholdChange,
  onTargetChange,
}) => {
  return (
    <div className="p-6 border-b border-gray-200 bg-indigo-50/50 border-l-4 border-l-indigo-500/40">
      <H3 className="mb-4">Define Your Goals</H3>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Selectors */}
        <div className="flex-1 flex flex-col gap-4">
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
                  onThresholdChange(parseInt(value) as DeepWorkThreshold);
              }}
              className="bg-gray-100 rounded-sm p-1"
            >
              {[30, 45, 60].map((t) => (
                <ToggleGroupItem
                  key={t}
                  value={t.toString()}
                  className="px-3 py-1.5 h-auto text-xs font-medium rounded-sm transition-all data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-black/5 data-[state=on]:hover:bg-black data-[state=on]:hover:text-white text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
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
                if (value) onTargetChange(parseInt(value));
              }}
              className="bg-gray-100 rounded-sm p-1"
            >
              {[1, 2, 3].map((n) => (
                <ToggleGroupItem
                  key={n}
                  value={n.toString()}
                  className="px-3 py-1.5 h-auto text-xs font-medium rounded-sm transition-all data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-black/5 data-[state=on]:hover:bg-black data-[state=on]:hover:text-white text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                >
                  {n}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Goal Context */}
        <div className="flex-1 md:max-w-xs">
          <Card className="bg-gray-100 rounded-sm p-4 border border-gray-200 shadow-none">
            <div className="space-y-2">
              <BodySmall className="text-gray-600">
                <span className="font-medium">Deep work block:</span> A
                continuous period of focused work without interruptions.
              </BodySmall>
              <BodySmall className="text-gray-600">
                <span className="font-medium">Daily target:</span> The number of{" "}
                {threshold}-min blocks you need to have a successful day.
              </BodySmall>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
