import { useState, useMemo, useEffect } from "react";
import { simulateDays } from "@/components/poisson-interrupt/simulation";
import type { DeepWorkThreshold } from "@/components/poisson-interrupt/constants";
import { PERSONAS } from "@/components/poisson-interrupt/constants";
import { SimulationControls } from "./SimulationControls";
import { GoalDefinition } from "./GoalDefinition";
import { SimulationStats } from "./SimulationStats";
import { DaysGrid } from "./DaysGrid";
import { DayDetailView } from "./DayDetailView";

// --- State Initialization Helper ---
function getInitialState() {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return {
      lambda: 1.0,
      recovery: 11,
      threshold: 60 as DeepWorkThreshold,
      targetBlockCount: 1,
      seed: 12345,
      selectedDayIndex: null as number | null,
      selectedPersonaId: "maker",
    };
  }

  const params = new URLSearchParams(window.location.search);

  // Only initialize from URL if params exist
  if (Array.from(params.keys()).length === 0) {
    return {
      lambda: 1.0,
      recovery: 11,
      threshold: 60 as DeepWorkThreshold,
      targetBlockCount: 1,
      seed: 12345,
      selectedDayIndex: null as number | null,
      selectedPersonaId: "maker",
    };
  }

  const getFloat = (k: string, def: number) => {
    const v = params.get(k);
    return v ? parseFloat(v) : def;
  };
  const getInt = (k: string, def: number) => {
    const v = params.get(k);
    return v ? parseInt(v, 10) : def;
  };

  const lambda = getFloat("lambda", 1.0);
  const recovery = getInt("delta", 11);

  const thresholdVal = getInt("len", 60);
  const threshold = (
    [30, 45, 60].includes(thresholdVal) ? thresholdVal : 60
  ) as DeepWorkThreshold;

  const targetBlockCount = getInt("target", 1);
  const seed = getInt("seed", 12345);

  const dayVal = params.get("day");
  let selectedDayIndex = dayVal !== null ? parseInt(dayVal, 10) : null;
  if (
    selectedDayIndex !== null &&
    (selectedDayIndex < 0 || selectedDayIndex >= 100)
  ) {
    selectedDayIndex = null;
  }

  // Determine persona based on lambda/recovery
  const match = PERSONAS.find(
    (p) =>
      p.id !== "custom" &&
      Math.abs((p.lambda || 0) - lambda) < 0.01 &&
      p.recovery === recovery
  );

  const selectedPersonaId = match ? match.id : "custom";

  return {
    lambda,
    recovery,
    threshold,
    targetBlockCount,
    seed,
    selectedDayIndex,
    selectedPersonaId,
  };
}

// --- Main Component ---

export function PoissonInterruptionsGrid() {
  // --- State ---
  const initial = useMemo(() => getInitialState(), []);

  // Simulation parameters
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(
    initial.selectedPersonaId
  );
  const [lambda, setLambda] = useState<number>(initial.lambda);
  const [recovery, setRecovery] = useState<number>(initial.recovery);

  const [threshold, setThreshold] = useState<DeepWorkThreshold>(
    initial.threshold
  );
  const [targetBlockCount, setTargetBlockCount] = useState<number>(
    initial.targetBlockCount
  );
  const [seed, setSeed] = useState<number>(initial.seed);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(
    initial.selectedDayIndex
  );

  // --- URL Sync ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("lambda", lambda.toFixed(1));
    params.set("delta", recovery.toString());
    params.set("len", threshold.toString());
    params.set("target", targetBlockCount.toString());
    params.set("seed", seed.toString());

    if (selectedDayIndex !== null) {
      params.set("day", selectedDayIndex.toString());
    } else {
      params.delete("day");
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    // Only update if changed to avoid loops or redundant updates
    if (newUrl !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [lambda, recovery, threshold, targetBlockCount, seed, selectedDayIndex]);

  // --- Handlers ---

  // --- Simulation ---
  const daysData = useMemo(() => {
    return simulateDays(100, lambda, recovery, seed);
  }, [lambda, recovery, seed]);

  // --- Stats for Summary ---
  const goodDaysCount = useMemo(() => {
    return daysData.filter((d) => {
      const qualifyingBlocksCapacity = d.blocks.reduce(
        (acc, b) => acc + Math.floor(b.duration / threshold),
        0
      );
      return qualifyingBlocksCapacity >= targetBlockCount;
    }).length;
  }, [daysData, threshold, targetBlockCount]);

  // --- Interaction ---
  const handleReseed = () => {
    setSeed(Math.floor(Math.random() * 100000));
    setSelectedDayIndex(null); // Reset view on reseed
  };

  const handlePersonaSelect = (id: string) => {
    setSelectedPersonaId(id);
    const p = PERSONAS.find((p) => p.id === id);
    if (p && p.id !== "custom") {
      setLambda(p.lambda!);
      setRecovery(p.recovery!);
    }
  };

  const handleSliderChange = (setter: (val: number) => void, val: number) => {
    setter(val);
    setSelectedPersonaId("custom");
  };

  return (
    <div className="w-full flex flex-col bg-white rounded-sm">
      {/* Section 1: Define Your Environment */}
      <SimulationControls
        selectedPersonaId={selectedPersonaId}
        lambda={lambda}
        recovery={recovery}
        onPersonaSelect={handlePersonaSelect}
        onLambdaChange={(v) => handleSliderChange(setLambda, v)}
        onRecoveryChange={(v) => handleSliderChange(setRecovery, v)}
      />

      {/* Section 2: Define Your Goals */}
      <GoalDefinition
        threshold={threshold}
        targetBlockCount={targetBlockCount}
        onThresholdChange={setThreshold}
        onTargetChange={setTargetBlockCount}
      />

      {/* Section 3: Your Likelihood of Success */}
      <SimulationStats
        goodDaysCount={goodDaysCount}
        targetBlockCount={targetBlockCount}
        threshold={threshold}
        onReseed={handleReseed}
      />

      {/* Section 4: Detailed Simulation */}
      <div className="border-t-4 border-gray-200"></div>
      <div className="p-6 flex justify-center bg-gray-50/50">
        {/* Detail View (Zoomed In) */}
        {selectedDayIndex !== null ? (
          <DayDetailView
            day={daysData[selectedDayIndex]}
            threshold={threshold}
            onBack={() => setSelectedDayIndex(null)}
            onNext={() =>
              setSelectedDayIndex(
                Math.min(daysData.length - 1, selectedDayIndex + 1)
              )
            }
            onPrev={() =>
              setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))
            }
            hasNext={selectedDayIndex < daysData.length - 1}
            hasPrev={selectedDayIndex > 0}
            lambda={lambda}
            delta={recovery}
            showNavigation={true}
          />
        ) : (
          /* Grid View */
          <DaysGrid
            daysData={daysData}
            threshold={threshold}
            targetBlockCount={targetBlockCount}
            onSelectDay={setSelectedDayIndex}
          />
        )}
      </div>
    </div>
  );
}
