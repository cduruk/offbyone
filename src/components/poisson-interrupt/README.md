<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Poisson Interruption Visualizer

An interactive web application that simulates and visualizes how random interruptions fragment deep work time. Includes two complementary visualizations:

1. **100-Day Simulation** (`/`) - See how interruptions destroy deep work capacity over 100 simulated workdays
2. **Focus Blocks Heatmap** (`/graph`) - Explore the parameter space of interruption rates and recovery times

---

## The Problem

In modern workplaces, interruptions are constant: Slack messages, emails, meetings, questions from colleagues. Each interruption doesn't just steal the time it takes to handle—it also destroys your focus, requiring additional recovery time to get back into deep work.

This app uses statistical modeling (Poisson distribution) to show you exactly how much productive time you're losing to interruptions and context switching.

---

## Key Features

### 🎯 Interactive 100-Day Simulation

- Simulates 100 full workdays (8 hours each)
- Uses Poisson distribution to model realistic interruption patterns
- Visualizes focus blocks, interruptions, and recovery penalties

### 👤 Six Persona Presets

Pre-configured work environments with realistic interruption rates:

- **Deep Work** (0.4 interruptions/hr, 7 min recovery)
- **Typical Maker** (1.0 interruptions/hr, 11 min recovery)
- **Manager** (2.2 interruptions/hr, 19 min recovery)
- **Executive** (3.0 interruptions/hr, 25 min recovery)
- **On-Call** (2.1 interruptions/hr, 17 min recovery)
- **Custom** (define your own parameters)

### 📊 Dual Visualization

- **Grid View**: See all 100 days at once with color-coded focus blocks
- **Detail View**: Drill down into individual days to see exact interruption timelines

### 📈 Statistical Analysis

- Success rate: Percentage of days meeting your deep work goals
- Total focus time per day
- Longest continuous block
- Expected interruptions and time lost to recovery

### 🔗 URL-Based Sharing

- All parameters sync to URL query strings
- Share specific simulation scenarios with others
- Deep linking to individual days

---

## Focus Blocks Heatmap (`/graph`)

A complementary visualization that helps you understand the relationship between interruption rates (λ) and recovery times (Δ).

### What It Shows

- **Heatmap Grid**: Each cell shows the expected number of focus blocks for a specific combination of λ and Δ
- **Parameter Space**: Visualizes λ from 0 to 4 interruptions/hour and Δ from 5 to 30 minutes recovery
- **Threshold Selection**: Switch between 30, 45, and 60-minute focus block thresholds
- **Monte Carlo Simulation**: Each cell runs 60 simulations to estimate expected outcomes
- **Interactive Exploration**: Hover over cells to see exact values for any parameter combination

### Use Cases

- **Scenario Planning**: Understand how reducing interruptions OR improving focus recovery affects outcomes
- **Team Discussions**: Visualize the tradeoffs between interrupt frequency and recovery time
- **Goal Setting**: Identify what combination of λ and Δ you need to achieve your deep work goals
- **Research & Analysis**: Export insights about the parameter space for presentations or reports

**Access it at:** `/graph` when running the dev server

---

## How It Works

### The Mathematics

**Poisson Distribution:**
Models random events (like interruptions) that occur independently at an average rate λ (lambda). If you experience 1 interruption per hour on average, you'll see about 8 interruptions in an 8-hour workday—but the exact number varies randomly each day.

**Recovery Penalty (Δ):**
Research shows it takes time to regain focus after an interruption. If you're interrupted at minute 120 with a 15-minute recovery penalty, you can't resume deep work until minute 135. This creates a compounding effect when interruptions cluster together.

**Deep Work Blocks:**
The app categorizes focus blocks by duration with color coding:

- **Red**: < 15 minutes (too fragmented for deep work)
- **Amber**: 15-30 minutes (shallow work only)
- **Indigo**: 30-45 minutes (moderate focus)
- **Teal**: 45+ minutes (deep work achieved)

**Block Capacity:**
A 90-minute focus block counts as:

- 3× 30-minute blocks, OR
- 2× 45-minute blocks, OR
- 1× 60-minute block

You set a threshold (30, 45, or 60 min) and target number of blocks per day. The app calculates what percentage of days you'll actually achieve your goal.

### The Algorithm

1. **Input**: You select interruption rate (λ), recovery time (Δ), and deep work threshold
2. **Simulation**: For each of 100 days:
   - Generate random number of interruptions using Poisson distribution
   - Randomly distribute interruptions across 8-hour workday
   - Calculate focus blocks between interruptions
   - Apply recovery penalty after each interruption
   - Handle cascading effects (interruption during recovery)
3. **Analysis**: Calculate statistics and visualize results
4. **Visualization**: Display grid view and enable drill-down to individual days

---

## Tech Stack

- **React 19** - Latest React with modern hooks
- **React Router** - Client-side routing for multiple visualizations
- **TypeScript 5.8** - Strict type checking
- **Vite 6** - Fast build tool and dev server
- **Tailwind CSS 3** - Utility-first styling with build-time processing
- **Shadcn UI** - Accessible component library built on Radix UI primitives
- **Lucide React** - Modern icon library
- **Pure SVG** - Custom visualizations (no chart library dependencies)

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd poisson-interrupt
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open in your browser:
   - **100-Day Simulation:** [http://localhost:3000](http://localhost:3000)
   - **Focus Blocks Heatmap:** [http://localhost:3000/graph](http://localhost:3000/graph)
   - **Embedding Demo:** [http://localhost:3000/demo](http://localhost:3000/demo)

   _Note: Port 3000 is configured in `vite.config.ts` (Vite's default is 5173)_

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Usage Guide

### Adjusting Parameters

**λ (Lambda) - Interruptions per Hour:**
Use the slider to set your average interruption rate (0.1 to 4.0 per hour). Think about Slack messages, emails, meetings, questions from colleagues, etc.

**Δ (Delta) - Recovery Time:**
Set how long it takes you to regain focus after an interruption (0 to 45 minutes). Research suggests 10-25 minutes is typical for knowledge workers.

**Deep Work Threshold:**
Define what counts as a "deep work block" for your work:

- 30 minutes: Moderate tasks, coding sessions
- 45 minutes: Complex problem-solving
- 60 minutes: Research, writing, deep analysis

**Target Blocks per Day:**
How many deep work blocks do you need to be productive? Set your daily goal (1-8 blocks).

### Interpreting the Visualization

**Grid View (100 Days):**

- Each cell represents one 8-hour workday
- Colors show the longest focus block that day
- ⭐ Star indicates a "good day" (met your target)
- Hover for detailed stats
- Striped patterns show recovery/gap time

**Detail View (Single Day):**

- Horizontal timeline showing 8 hours
- Blue blocks: Focus time
- Red dashed lines: Interruptions
- Hatched patterns: Recovery penalties
- Navigate between days with arrow buttons

### Sharing Scenarios

Click "Reseed" to randomize the simulation, or adjust parameters. The URL automatically updates with all settings. Copy and share the URL to show others your specific scenario.

---

## Project Structure

```
poisson-interrupt/
├── components/              # React UI components
│   ├── PoissonInterruptionsGrid.tsx  # 100-day simulation (main app)
│   ├── FocusBlocksHeatmap.tsx        # Parameter space heatmap (/graph)
│   ├── SimulationControls.tsx        # Persona & parameter sliders
│   ├── SimulationStats.tsx           # Statistical analysis display
│   ├── ControlSlider.tsx             # Reusable slider component
│   ├── GoalDefinition.tsx            # Deep work goal configuration
│   ├── ImpactAnalysis.tsx            # Real-time parameter impact
│   ├── DaysGrid.tsx                  # 100-day grid visualization
│   ├── DayDetailView.tsx             # Single day timeline view
│   ├── DayDetailEmbed.tsx            # Embeddable day view
│   ├── DaysGridEmbed.tsx             # Embeddable grid view
│   ├── FocusBlocksHeatmapEmbed.tsx   # Embeddable heatmap
│   ├── EmbedDemo.tsx                 # Embedding demonstration (/demo)
│   ├── Typography.tsx                # Standardized text components
│   └── ui/                           # Shadcn UI components
│       ├── button.tsx                # Button component
│       ├── card.tsx                  # Card container
│       ├── slider.tsx                # Slider input
│       ├── toggle.tsx                # Toggle switch
│       └── toggle-group.tsx          # Toggle group
├── lib/                     # Business logic & utilities
│   ├── simulation.ts        # Poisson simulation engine
│   ├── constants.ts         # Persona configs & color definitions
│   └── utils.ts             # Helper functions (colors, formatting)
├── App.tsx                  # Routing configuration
├── index.tsx                # React entry point
├── index.css                # Global styles & CSS variables
├── vite.config.ts           # Vite build configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── components.json          # Shadcn UI configuration
├── verify-consistency.ts    # Simulation verification script
├── ASTRO_EMBEDDING_GUIDE.md # Embedding documentation
└── AGENTS.md                # Developer conventions
```

### Routes

- `/` - 100-day simulation with persona controls
- `/graph` - Focus blocks heatmap visualization
- `/demo` - Embedding demonstration page (shows all embeddable components)

Both routes are independently usable and can be embedded in other applications.

### Embedding in Other Applications

This project provides embeddable React components that can be integrated into other websites and applications:

**Embeddable Components:**
- **`DaysGridEmbed`** - Standalone 100-day simulation grid
- **`DayDetailEmbed`** - Single day timeline view
- **`FocusBlocksHeatmapEmbed`** - Parameter space heatmap
- **`EmbedDemo`** - Demonstration page showing all embed components

**How to Use:**
1. Visit `/demo` to see all embeddable components in action
2. Each component accepts simulation parameters as props
3. Components are self-contained with no external dependencies
4. For detailed integration instructions (including Astro, Next.js, and vanilla HTML), see [ASTRO_EMBEDDING_GUIDE.md](ASTRO_EMBEDDING_GUIDE.md)

For detailed developer documentation and conventions, see [AGENTS.md](AGENTS.md).

---

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development

The project uses comprehensive code quality tooling:

**Type Checking:**

```bash
npm run type-check    # Run TypeScript strict mode checks
```

**Linting:**

```bash
npm run lint          # Check for code issues
npm run lint:fix      # Auto-fix linting issues
```

**Formatting:**

```bash
npm run format        # Format all files with Prettier
npm run format:check  # Check formatting without modifying files
```

**Verify Simulation Consistency:**

```bash
npm run verify        # Confirm heatmap and main app use identical simulation logic
```

This runs a verification script that:

- Tests both visualizations with multiple parameter combinations
- Confirms they use the same `simulateDays()` function from `lib/simulation.ts`
- Validates identical capacity calculations: `Math.floor(duration / threshold)`
- Ensures Monte Carlo estimates converge to expected values

**Run All Checks:**

```bash
npm run type-check && npm run lint && npm run format:check && npm run verify
```

### Code Style

- **TypeScript** with strict mode enabled
- **ESLint** for code quality (TypeScript + React rules)
- **Prettier** for consistent formatting
- Follow existing naming conventions (PascalCase for components, camelCase for functions)
- Use Tailwind CSS for styling
- Functional components with hooks (no class components)

---

## License

[Add your license here]

---

## Acknowledgments

Built with React, TypeScript, and Vite. Visualization inspired by the need to understand the hidden costs of workplace interruptions and context switching.
