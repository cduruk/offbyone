import { Shield, User, Briefcase, Zap, Siren, Sliders } from "lucide-react";

// --- Constants ---
export const GRID_COLS = 10;
export const GRID_ROWS = 10;
export const DAY_WIDTH = 100; // SVG units
export const DAY_HEIGHT = 24; // SVG units
export const ROW_HEIGHT = 40; // SVG units
export const COL_WIDTH = 110; // SVG units (includes gap)
export const GRID_MARGIN = 10; // Margin around the grid to prevent clipping
export const SVG_WIDTH = GRID_COLS * COL_WIDTH + GRID_MARGIN * 2;
export const SVG_HEIGHT = GRID_ROWS * ROW_HEIGHT + GRID_MARGIN * 2;
export const DAY_MINUTES = 480;

// --- Types ---
export type DeepWorkThreshold = 30 | 45 | 60;

/**
 * Persona presets for different work environments.
 *
 * Note: The `desc` field is preserved for reference but is no longer displayed
 * in the UI. During the Shadcn migration, description text was removed from
 * persona selector cards (SimulationControls.tsx) to prevent text overflow issues.
 * Cards now display only icon + label for a cleaner, more compact design.
 */
export const PERSONAS = [
  {
    id: "deep_work",
    label: "Deep Work",
    desc: "Async-first, few meetings",
    lambda: 0.4,
    recovery: 7,
    icon: Shield,
  },
  {
    id: "maker",
    label: "Typical Maker",
    desc: "Daily standup, some pings",
    lambda: 1.0,
    recovery: 11,
    icon: User,
  },
  {
    id: "manager",
    label: "Manager",
    desc: "Coordination heavy",
    lambda: 2.2,
    recovery: 19,
    icon: Briefcase,
  },
  {
    id: "executive",
    label: "Executive",
    desc: "Context switching pro",
    lambda: 3.0,
    recovery: 25,
    icon: Zap,
  },
  {
    id: "on_call",
    label: "On-Call",
    desc: "Firefighting mode",
    lambda: 2.1,
    recovery: 17,
    icon: Siren,
  },
  {
    id: "custom",
    label: "Custom",
    desc: "Configure manually",
    lambda: null,
    recovery: null,
    icon: Sliders,
  },
];
