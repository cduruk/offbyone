# Embedding Poisson Interruption Visualizer in Astro Blog

Guide for embedding this React app into your Astro blog (based on the offbyone repository pattern).

## Table of Contents

1. [Quick Start: React Component Embedding](#quick-start-react-component-embedding-recommended)
2. [Understanding the Parameters](#understanding-the-parameters)
3. [Available Components](#available-components)
4. [Component Comparison](#component-comparison)
5. [What Files Do You Need?](#what-files-do-you-need)
6. [Real-World Example](#real-world-example)
7. [Performance Tips](#performance-tips)
8. [Advanced: Full App Integration](#advanced-full-app-integration)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start: React Component Embedding (Recommended)

**NEW:** The app now includes standalone embeddable components (`DaysGridEmbed` and `DayDetailEmbed`) that you can import directly into your Astro MDX files. These components accept simulation parameters as props - no URL routing needed!

### Step 1: Copy Components to Your Blog

```bash
# Copy components
cp -r components/ /path/to/your-blog/src/components/poisson-interrupt/

# Copy lib (simulation logic & constants)
cp -r lib/ /path/to/your-blog/src/lib/poisson-interrupt/
```

### Step 2: Update Import Paths

Change `@/` alias imports to `~/` (or whatever alias your Astro blog uses):

```bash
# In your blog's copied files
find /path/to/your-blog/src/components/poisson-interrupt -type f -name "*.tsx" \
  -exec sed -i '' 's/@\/components/~\/components/g' {} +

find /path/to/your-blog/src/components/poisson-interrupt -type f -name "*.tsx" \
  -exec sed -i '' 's/@\/lib/~\/lib\/poisson-interrupt/g' {} +
```

### Step 3: Install Dependencies

Ensure your blog has these dependencies (likely already installed if you use Shadcn):

```bash
npm install @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-toggle @radix-ui/react-toggle-group lucide-react clsx tailwind-merge class-variance-authority
```

### Step 4: Use in Your MDX Files

```mdx
---
title: "The Fragmentation of Time"
description: "How interruptions destroy deep work capacity"
publishDate: "2025-01-XX"
---

import { DaysGridEmbed } from "~/components/poisson-interrupt/DaysGridEmbed";
import { DayDetailEmbed } from "~/components/poisson-interrupt/DayDetailEmbed";

Your introduction text here...

<DaysGridEmbed
  lambda={1.0}
  delta={11}
  len={60}
  target={1}
  seed={12345}
  client:load
/>

More text...

<DayDetailEmbed
  lambda={1.0}
  delta={11}
  len={60}
  seed={12345}
  day={15}
  showNavigation={true}
  client:load
/>

Rest of your blog post...
```

---

## Understanding the Parameters

Before using the components, it's helpful to understand what each parameter represents:

### lambda (λ) - Interruptions Per Hour

The average rate of interruptions, modeled using a Poisson distribution. This represents random events like Slack messages, emails, meetings, or questions from colleagues.

- **0.4** = Very focused environment (Deep Work mode - 1 interruption every 2.5 hours)
- **1.0** = Typical maker schedule (~1 interruption per hour)
- **2.2** = Manager schedule (~2 interruptions per hour)
- **3.0** = Executive schedule (frequent context switching)

### delta (δ) - Recovery Time in Minutes

The time it takes to regain focus after an interruption. Research shows knowledge workers need significant time to get back into "flow state" after being interrupted.

- **7 min** = Quick refocus (simple tasks, already in context)
- **11 min** = Typical refocus time (moderate complexity work)
- **15-19 min** = Longer refocus (complex problem-solving)
- **25 min** = Deep refocus (highly complex technical work)

### len - Deep Work Threshold

The minimum continuous time needed to count as a "productive block" for your type of work:

- **30 minutes** = Moderate tasks, code reviews, documentation
- **45 minutes** = Complex problem-solving, design work
- **60 minutes** = Research, architecture, deep analysis

### seed - Random Seed

A number that makes the simulation reproducible. Using the same seed with the same parameters will always generate the same results. Change the seed to see different random outcomes.

- Use consistent seeds for blog posts (readers see the same visualization)
- Change seeds to explore variation in outcomes

---

## Available Components

The app provides three embeddable components, each designed for different use cases:

### Available Component Props

**DaysGridEmbed Props:**

- `lambda` (number, default: 1.0) - Interruptions per hour
- `delta` (number, default: 11) - Recovery time in minutes
- `len` (30 | 45 | 60, default: 60) - Deep work threshold
- `target` (number, default: 1) - Blocks needed for a "good day"
- `seed` (number, default: 12345) - Random seed for reproducible results
- `showOverlay` (boolean, default: true) - Show click-to-reveal overlay (recommended for blog posts)
- `onSelectDay` (function, optional) - Callback when a day is clicked

**DayDetailEmbed Props:**

- `lambda` (number, default: 1.0) - Interruptions per hour
- `delta` (number, default: 11) - Recovery time in minutes
- `len` (30 | 45 | 60, default: 60) - Deep work threshold
- `seed` (number, default: 12345) - Random seed for reproducible results
- `day` (number, default: 0) - Specific day index 0-99
- `showNavigation` (boolean, default: false) - Enable prev/next buttons

**FocusBlocksHeatmapEmbed Props:**

- `threshold` (30 | 45 | 60, default: 45) - Deep work threshold in minutes
- `showThresholdControl` (boolean, default: true) - Show toggle to switch between 30/45/60 min thresholds
- `highlightedCells` (array, default: []) - Specific cells to highlight with red border
  - Format: `[{ lambda: 1.0, delta: 11 }, { lambda: 2.0, delta: 15 }]`
  - Useful for drawing attention to specific scenarios in blog posts

**Usage Example:**

```mdx
import { FocusBlocksHeatmapEmbed } from "~/components/poisson-interrupt/FocusBlocksHeatmapEmbed";

<FocusBlocksHeatmapEmbed
  threshold={45}
  showThresholdControl={true}
  highlightedCells={[
    { lambda: 1.0, delta: 11 },
    { lambda: 2.2, delta: 19 },
  ]}
  client:load
/>
```

The heatmap visualization shows expected deep work blocks across different combinations of interruption rates (λ) and recovery times (δ). Each cell runs 60 Monte Carlo simulations to estimate the average outcome. Use `highlightedCells` to emphasize specific scenarios in your narrative.

### Demo Page

Visit `/demo` in the running app to see live examples of all three components with different configurations:

```bash
npm run dev
# Visit http://localhost:3000/demo
```

---

## Component Comparison

Choosing the right component for your blog post:

| Component                   | Purpose                                 | Best For                                               | Performance               |
| --------------------------- | --------------------------------------- | ------------------------------------------------------ | ------------------------- |
| **DaysGridEmbed**           | 100-day grid showing patterns over time | Demonstrating long-term impact of interruptions        | Fast (single simulation)  |
| **DayDetailEmbed**          | Detailed timeline of a single day       | Explaining how interruptions fragment a specific day   | Very fast (one day only)  |
| **FocusBlocksHeatmapEmbed** | Parameter space comparison heatmap      | Finding optimal λ/δ combinations, comparative analysis | Slower (60 sims per cell) |

**When to use each:**

- Use **DaysGridEmbed** to show "here's what 100 days looks like under these conditions"
- Use **DayDetailEmbed** to explain "here's exactly what happens on day 15"
- Use **FocusBlocksHeatmapEmbed** to explore "how do different interrupt rates compare?"

---

### Benefits of Component Embedding

- ✅ Full control over styling and theming
- ✅ Type-safe props with TypeScript
- ✅ Can integrate with your blog's React context/state
- ✅ No iframe limitations (scrolling, sizing, etc.)
- ✅ Can customize navigation and interactions
- ✅ Works seamlessly with Astro's component islands

---

## What Files Do You Need?

Depending on your use case, you can copy just what you need:

### Minimal Setup (Embed Components Only)

```
components/
  DaysGridEmbed.tsx       # 100-day grid
  DaysGrid.tsx            # (required by DaysGridEmbed)
  DayDetailEmbed.tsx      # Single day view
  DayDetailView.tsx       # (required by DayDetailEmbed)
  FocusBlocksHeatmapEmbed.tsx  # Heatmap visualization
  Typography.tsx          # Text components
  ui/                     # All Shadcn UI components
    button.tsx
    card.tsx
    slider.tsx
    toggle.tsx
    toggle-group.tsx
lib/
  simulation.ts           # Core simulation logic
  constants.ts            # Color definitions
  utils.ts                # Helper functions
```

### Full App Integration

If you want the complete interactive app with persona selectors and URL routing, copy all files from `components/` and `lib/`.

---

## Real-World Example

Here's how you might use multiple components in a blog post about maker vs manager schedules:

```mdx
---
title: "Maker Schedule vs Manager Schedule"
publishDate: "2025-01-15"
---

import { DaysGridEmbed } from "~/components/poisson-interrupt/DaysGridEmbed";
import { FocusBlocksHeatmapEmbed } from "~/components/poisson-interrupt/FocusBlocksHeatmapEmbed";

## The Problem with Context Switching

Paul Graham famously wrote about the [Maker's Schedule, Manager's Schedule](http://www.paulgraham.com/makersschedule.html).
Let's visualize the difference.

### Maker Schedule (λ=1.0, δ=11min)

A typical maker experiences about 1 interruption per hour, with 11 minutes to regain focus:

<DaysGridEmbed
  lambda={1.0}
  delta={11}
  len={60}
  target={2}
  seed={12345}
  client:load
/>

You'll notice that even with just one interruption per hour, achieving 2+ hours of deep work per day
is challenging. Only about 60% of days meet this goal.

### Manager Schedule (λ=2.2, δ=19min)

Now compare to a manager's schedule with frequent meetings and Slack messages:

<DaysGridEmbed
  lambda={2.2}
  delta={19}
  len={60}
  target={2}
  seed={12345}
  client:load
/>

The difference is striking. With 2.2 interruptions per hour and longer recovery times,
deep work becomes nearly impossible.

### Finding Your Sweet Spot

Use this heatmap to explore different combinations:

<FocusBlocksHeatmapEmbed
  threshold={60}
  showThresholdControl={true}
  highlightedCells={[
    { lambda: 1.0, delta: 11 },
    { lambda: 2.2, delta: 19 },
  ]}
  client:load
/>

The highlighted cells show our two scenarios. Notice how reducing interruptions OR improving
focus recovery can dramatically improve outcomes.
```

---

## Performance Tips

### Use the Overlay (Default Behavior)

**DaysGridEmbed** includes `showOverlay={true}` by default, which displays a "Click to run simulation" overlay:

**Benefits:**

- Defers expensive rendering until user interaction
- Reduces initial page load time
- Creates better reading experience (readers aren't distracted by animations)
- Only one simulation runs even if you embed multiple grids

**When to disable:**

```mdx
<DaysGridEmbed showOverlay={false} ... />  // Runs immediately, use sparingly
```

### Heatmap Performance

**FocusBlocksHeatmapEmbed** runs 60 simulations per cell. This is computationally intensive:

- Total simulations: ~600 (10 λ values × 6 δ values × 60 runs)
- Load time: 1-2 seconds on modern hardware
- Recommendation: Use overlay or load with `client:idle` in Astro

```mdx
<FocusBlocksHeatmapEmbed client:idle /> // Loads after page is interactive
```

### Seeds for Consistency

Always use the same `seed` value in blog posts so readers see identical results:

```mdx
<DaysGridEmbed seed={12345} ... />  // Everyone sees the same 100 days
```

Change seeds when you want to show variation:

```mdx
<DaysGridEmbed seed={11111} ... />  // Different random outcome
<DaysGridEmbed seed={22222} ... />  // Another variation
```

---

## Advanced: Full App Integration

If you prefer to integrate the components directly into your Astro site (for tighter integration, theming, or custom modifications), follow these steps:

## 1. Copy Component Files

Copy these directories from `poisson-interrupt/` to your Astro blog:

```bash
# Copy components
cp -r components/ /path/to/offbyone/src/components/poisson-interrupt/

# Copy lib (simulation logic & constants)
cp -r lib/ /path/to/offbyone/src/lib/poisson-interrupt/
```

## 2. Update Import Paths

Since you're moving files, update the `@/` alias imports in all copied components:

**Before:**

```typescript
import { Button } from "@/components/ui/button";
```

**After:**

```typescript
import { Button } from "~/components/ui/button";
```

(Assuming your Astro blog uses `~` as the alias - check your `tsconfig.json`)

## 3. Handle Shadcn UI Components

Your blog likely doesn't have Shadcn components yet. You have two options:

**Option A: Install Shadcn in your Astro blog**

```bash
cd /path/to/offbyone
npx shadcn@latest init
npx shadcn@latest add button slider card
```

**Option B: Copy the Shadcn components from this project**

```bash
cp -r components/ui/ /path/to/offbyone/src/components/ui/
cp lib/utils.ts /path/to/offbyone/src/lib/utils.ts
```

## 4. Handle CSS Variables

**Since your blog already uses Shadcn**, you have several options:

### Option A: Use Existing Variables (Recommended)

Your blog likely already has Shadcn CSS variables defined. **No changes needed!** The components will automatically use your existing theme.

Simply test the component - if it looks good, you're done with CSS setup.

### Option B: Scoped Theme (If you want different styling)

If you want the visualizer to have its own theme without affecting your blog's global styles, create a scoped wrapper:

**1. Create a scoped CSS file:**

```css
/* src/components/poisson-interrupt/poisson-theme.css */
.poisson-interrupt-scope {
  /* Only override variables that need to be different */
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;

  /* Optionally override other variables */
  /* --background: 210 40% 98%; */
  /* --foreground: 215 25.7% 26.7%; */
  /* ... etc */
}
```

**2. Create a wrapper component:**

```tsx
// src/components/poisson-interrupt/PoissonInterruptWrapper.tsx
import PoissonInterruptionsGrid from "./PoissonInterruptionsGrid";
import "./poisson-theme.css";

export default function PoissonInterruptWrapper() {
  return (
    <div className="poisson-interrupt-scope">
      <PoissonInterruptionsGrid />
    </div>
  );
}
```

**3. Use the wrapper in your MDX:**

```mdx
import PoissonInterruptWrapper from "~/components/poisson-interrupt/PoissonInterruptWrapper";

<PoissonInterruptWrapper client:load />
```

### Option C: Full Theme Override (If blog doesn't have Shadcn)

If your blog doesn't have Shadcn CSS variables at all, add them to your global CSS:

```css
/* In your global CSS file (probably src/styles/global.css) */
@layer base {
  :root {
    --background: 210 40% 98%;
    --foreground: 215 25.7% 26.7%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}
```

## 5. Create the Blog Post

Create a new MDX file in your blog:

```bash
mkdir -p /path/to/offbyone/src/content/blog/poisson-interruption-visualizer
```

**File: `index.mdx`**

```mdx
---
title: "Poisson Interruption Visualizer"
description: "See how random interruptions fragment your deep work time"
publishDate: "2025-01-XX"
tags: ["productivity", "interactive", "data-visualization"]
---

import PoissonInterruptionsGrid from "~/components/poisson-interrupt/PoissonInterruptionsGrid";

Your introduction text here...

<PoissonInterruptionsGrid client:load />

Rest of your blog post...
```

## 6. Key Differences from Your Current Tailwind Setup

Your blog currently uses **Tailwind v4** (via `@tailwindcss/vite`), but this app now uses **Tailwind v3**. You have two options:

**Option A: Keep Tailwind v4 in blog, adjust Shadcn components**

- Shadcn components should work with Tailwind v4
- You may need to adjust the CSS variables approach

**Option B: Keep both systems separate**

- Use scoped styles or CSS modules to isolate the component
- Not recommended - more complex

## 7. Verify Dependencies

Make sure your blog's `package.json` includes:

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@radix-ui/react-slider": "latest",
    "@radix-ui/react-slot": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "lucide-react": "latest"
  }
}
```

## 8. Test Locally

```bash
cd /path/to/offbyone
npm install
npm run dev
```

Navigate to your new blog post and verify everything renders correctly.

## 9. Important Notes

- **Client directive required**: Use `client:load` on the component since it's interactive
- **No separate bundle needed**: Unlike your pipeline calculator example, this uses direct imports
- **Shared React context**: All Shadcn components need to be in the same React tree (already handled since everything is under `PoissonInterruptionsGrid`)
- **URL state management**: The component uses URL params - make sure your Astro routing doesn't interfere

## 10. Potential Issues to Watch For

1. **Path alias mismatch**: Your blog might use `~` instead of `@`
2. **Tailwind version conflict**: v3 vs v4 - but CSS variables should work across versions
3. **Build-time vs runtime CSS**: Astro handles CSS differently than Vite
4. **Theme compatibility**: If colors look off, use the scoped theme approach (Option B in step 4)

## Files That Need Path Updates

When copying to Astro, these files have `@/` imports that need updating:

- `components/ControlSlider.tsx`
- `components/SimulationControls.tsx`
- `components/GoalDefinition.tsx`
- `components/DayDetailView.tsx`
- `components/SimulationStats.tsx`
- `components/ImpactAnalysis.tsx`
- `components/DaysGridEmbed.tsx` _(standalone grid for embedding)_
- `components/DayDetailEmbed.tsx` _(standalone day detail for embedding)_
- `components/FocusBlocksHeatmapEmbed.tsx` _(standalone heatmap for parameter comparison)_

Use find-and-replace to update all instances:

- Find: `@/components/ui/`
- Replace: `~/components/ui/`
- Find: `@/lib/`
- Replace: `~/lib/poisson-interrupt/`

## Embeddable Components

The following standalone components are designed specifically for embedding in blog posts:

**DaysGridEmbed.tsx** - Grid visualization that accepts props (no URL routing)
**DayDetailEmbed.tsx** - Single day timeline that accepts props (no URL routing)
**FocusBlocksHeatmapEmbed.tsx** - Heatmap for parameter space comparison (no URL routing)

These components generate simulation data internally based on the props you provide, making them perfect for creating multiple variations of the visualization across different blog posts with different parameters.

---

## Troubleshooting

### Import Error: "Cannot find module '@/components/ui/button'"

**Problem:** TypeScript can't resolve the `@/` or `~/` path alias.

**Solution:**

1. Verify you updated all imports from `@/` to `~/` (or your blog's alias)
2. Check your `tsconfig.json` has the correct path mapping:

```json
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

### Components Not Rendering in Astro

**Problem:** Components show as blank or don't load.

**Solution:**

- Add `client:load` directive to all React components in MDX:
  ```mdx
  <DaysGridEmbed client:load />
  ```
- For better performance, use `client:idle` or `client:visible`
- Verify React 19.2+ is installed

### Styling Looks Wrong or Missing

**Problem:** Components render but don't have correct colors/styling.

**Solution:**

1. Verify CSS variables are defined (see Advanced section, Option C)
2. Check that Tailwind is processing the component files
3. Add component paths to your `tailwind.config.ts`:
   ```js
   content: [
     "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
     "./src/components/poisson-interrupt/**/*.tsx", // Add this
   ];
   ```

### TypeScript Errors After Copying Files

**Problem:** Type errors like "Property 'lambda' does not exist"

**Solution:**

- Ensure all required files are copied (check "What Files Do You Need?" section)
- Verify `lib/simulation.ts`, `lib/constants.ts`, and `lib/utils.ts` are present
- Check that TypeScript can find the types

### Heatmap Takes Too Long to Load

**Problem:** FocusBlocksHeatmapEmbed causes page to freeze or load slowly.

**Solution:**

- Use `client:idle` instead of `client:load`:
  ```mdx
  <FocusBlocksHeatmapEmbed client:idle />
  ```
- This defers rendering until the page is interactive
- Consider using `showOverlay={true}` to defer calculation until user clicks

### Build Error: "Cannot find module 'lucide-react'"

**Problem:** Missing dependencies during build.

**Solution:**

```bash
npm install lucide-react @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-toggle @radix-ui/react-toggle-group clsx tailwind-merge class-variance-authority
```

### Components Work Locally But Not in Production Build

**Problem:** Components render in dev mode (`npm run dev`) but fail in production.

**Solution:**

1. Check browser console for errors
2. Verify all imports use correct paths (relative imports can break in production)
3. Ensure client directives are present
4. Check that Astro is configured to handle React 19+

### Colors Don't Match Original App

**Problem:** Embed components use different colors than the demo.

**Solution:**

- Copy the CSS variables from `index.css` in the original project
- Add them to your global styles with the `.poisson-interrupt-scope` class
- Or embrace your blog's theme - the components adapt to Shadcn variables

---

## Need More Help?

- **Demo:** Run `npm run dev` and visit `/demo` to see working examples
- **Source:** Check the actual component implementations in this repository
- **Issues:** Open an issue on the GitHub repository if you encounter problems
