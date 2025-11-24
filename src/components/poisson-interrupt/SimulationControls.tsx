import React from "react";
import { ControlSlider } from "./ControlSlider";
import { ImpactAnalysis } from "./ImpactAnalysis";
import { PERSONAS } from "@/components/poisson-interrupt/constants";
import { H3 } from "./Typography";
import { Button } from "@/components/ui/button";

interface SimulationControlsProps {
  selectedPersonaId: string;
  lambda: number;
  recovery: number;
  onPersonaSelect: (id: string) => void;
  onLambdaChange: (val: number) => void;
  onRecoveryChange: (val: number) => void;
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
    <div className="p-6 border-b border-gray-200 bg-amber-50/50 border-l-4 border-l-amber-500/40">
      {/* Persona Grid */}
      <div>
        <div className="flex justify-between items-baseline mb-4">
          <H3>Define Your Environment</H3>
          <span className="text-xs text-gray-500 hidden sm:inline">
            Choose a persona or adjust parameters
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PERSONAS.map((p) => (
            <Button
              key={p.id}
              variant="outline"
              onClick={() => onPersonaSelect(p.id)}
              className={`relative flex flex-col items-center p-3 h-auto rounded-sm border-2 text-center transition-all duration-200 ${
                selectedPersonaId === p.id
                  ? "border-gray-900 bg-gray-100 ring-1 ring-gray-900/15"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
              }`}
            >
              <div
                className={`p-1.5 rounded-sm mb-2 ${selectedPersonaId === p.id ? "bg-gray-200 text-gray-900" : "bg-gray-200 text-gray-500"}`}
              >
                <p.icon size={20} strokeWidth={2} />
              </div>
              <div className="font-bold text-xs text-gray-900">{p.label}</div>
            </Button>
          ))}
        </div>
      </div>

      {/* Parameters Section - Always Visible */}
      <div className="mt-6 pt-6 border-t border-gray-200 relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 bg-white text-[10px] text-gray-500 font-medium uppercase tracking-wide">
          Parameters
        </div>

        <div className="flex flex-col md:flex-row gap-6">
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
  );
};
