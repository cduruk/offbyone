/**
 * Simulation logic for Poisson Process interruptions.
 */

export interface WorkBlock {
  start: number;
  end: number;
  duration: number;
}

export interface DayStats {
  dayIndex: number;
  interruptions: number;
  interruptionTimes: number[];
  blocks: WorkBlock[];
  longestBlock: number;
  totalFocus: number;
  blocksOver30: number;
  blocksOver45: number;
  blocksOver60: number;
}

// Simple seeded RNG (Mulberry32) for reproducible simulations
function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Knuth's algorithm for Poisson sampling
// Returns number of events k for a given expected value lambda
function getPoisson(lambda: number, random: () => number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= random();
  } while (p > L);
  return k - 1;
}

const DAY_LENGTH_MINUTES = 480; // 8 hours

export function simulateDays(
  totalDays: number,
  interruptionsPerHour: number,
  recoveryTimeMinutes: number,
  seed: number
): DayStats[] {
  const random = mulberry32(seed);
  const days: DayStats[] = [];

  // Total expected interruptions in an 8-hour day
  const lambdaDay = interruptionsPerHour * 8;

  for (let i = 0; i < totalDays; i++) {
    // 1. Determine number of interruptions for this day
    const numInterruptions = getPoisson(lambdaDay, random);

    // 2. Determine timestamps for interruptions
    const interruptionTimes: number[] = [];
    for (let j = 0; j < numInterruptions; j++) {
      interruptionTimes.push(random() * DAY_LENGTH_MINUTES);
    }
    interruptionTimes.sort((a, b) => a - b);

    // 3. Construct focus blocks taking recovery time into account
    // Definition:
    // - Day starts at 0.
    // - Interruption at t_i means focus stops at t_i.
    // - Focus cannot resume until t_i + recovery.
    // - Effective interval is [Previous_End, t_i).
    // - Next start is t_i + recovery.

    const blocks: WorkBlock[] = [];
    let currentFocusStart = 0;

    // We iterate through interruptions plus a virtual interruption at day end
    const events = [...interruptionTimes, DAY_LENGTH_MINUTES];

    for (let j = 0; j < events.length; j++) {
      const interruptTime = events[j];

      // The work block goes from where we last started focusing until this interruption
      const blockStart = currentFocusStart;
      const blockEnd = interruptTime;

      if (blockEnd > blockStart) {
        blocks.push({
          start: blockStart,
          end: blockEnd,
          duration: blockEnd - blockStart,
        });
      }

      // The NEXT block cannot start until we recover from this interruption.
      // Note: If the event is the end of day (480), currentFocusStart becomes > 480, loop finishes.
      // If multiple interruptions happen during recovery (e.g. interrupt at 100, recover till 110, interrupt at 105),
      // The logic:
      // 1. Interrupt at 105. Block end = 105.
      // 2. But wait, currentFocusStart was set by previous interrupt.
      // Let's trace carefully:
      // Interrupt 1 at 100. Start=0. End=100. Block [0,100]. Next Start = 110.
      // Interrupt 2 at 105. Start=110. End=105. 105 > 110 is False. No Block. Next Start = 105 + 10 = 115.
      // This correctly models "chain interruptions" preventing work.

      currentFocusStart = Math.min(
        interruptTime + recoveryTimeMinutes,
        DAY_LENGTH_MINUTES
      );

      // Optimization: If recovery pushes us past end of day, stop early
      if (currentFocusStart >= DAY_LENGTH_MINUTES) break;
    }

    // 4. Calculate Stats
    const longestBlock =
      blocks.length > 0 ? Math.max(...blocks.map((b) => b.duration)) : 0;
    const totalFocus = blocks.reduce((sum, b) => sum + b.duration, 0);

    // Update logic: Count how many blocks fit into the duration (Capacity)
    // e.g. 90 min block = 3 x 30min blocks
    const blocksOver30 = blocks.reduce(
      (acc, b) => acc + Math.floor(b.duration / 30),
      0
    );
    const blocksOver45 = blocks.reduce(
      (acc, b) => acc + Math.floor(b.duration / 45),
      0
    );
    const blocksOver60 = blocks.reduce(
      (acc, b) => acc + Math.floor(b.duration / 60),
      0
    );

    days.push({
      dayIndex: i,
      interruptions: numInterruptions,
      interruptionTimes,
      blocks,
      longestBlock,
      totalFocus,
      blocksOver30,
      blocksOver45,
      blocksOver60,
    });
  }

  return days;
}
