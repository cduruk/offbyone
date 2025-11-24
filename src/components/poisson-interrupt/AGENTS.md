# Component Developer Guide

> **Note:** For project overview, features, and user documentation, see [README.md](README.md).
> This file contains developer-focused context for maintaining the Poisson Interruption components.

## Overview

These components were originally developed as a standalone React/Vite application and have been integrated into the Astro blog. They provide interactive visualizations for understanding how interruptions fragment deep work time.

## Architecture & Structure

- **Stack**: React 19, TypeScript, Tailwind CSS, Lucide React (integrated within Astro)
- **Structure**:
  - `components/`: React UI components for visualizations
  - `lib/`: Business logic including simulation engine and constants
  - `styles/`: CSS custom properties in `/src/styles/poisson-visualizations.css`
- **Key Logic**: `simulation.ts` handles `simulateDays` using a seeded RNG and Poisson distribution
- **Visualization**: Custom SVG implementation without chart library dependencies

## Code Style & Conventions

- **Naming**: PascalCase for components, camelCase for functions/vars
- **Types**: Strict TypeScript. Define interfaces (e.g., `DayStats`, `WorkBlock`) in `lib/` or locally
- **Styling**: Use Tailwind CSS utility classes. Avoid inline styles for layout
- **Imports**: Group imports: React/Libs -> Internal Logic -> Components -> Assets/Icons
- **Components**: Functional components with hooks. Avoid class components
- **Icons**: Use `lucide-react`

## Integration Notes

- Components use Astro's `client:load` directive for hydration
- CSS variables must be imported in any page/post that uses these components
- Components are self-contained and can be used in both standalone pages and embedded in blog posts

## Dark Mode Implementation

### CSS Variables Location

The component's styling uses CSS custom properties defined in `/src/styles/poisson-visualizations.css` in the parent Astro blog. This file must be imported in any page or post that uses the visualizations.

**Import in Astro pages:**

```astro
---
import '@/styles/poisson-visualizations.css'
---
```

**Import in MDX files:**

```mdx
import '@/styles/poisson-visualizations.css

'
```

### SVG Text Styling for Dark Mode

Through testing and iteration, we found the optimal approach for SVG text readability:

**Adaptive Fill Colors:**

```tsx
// ✅ Correct - readable in both modes
className = 'fill-gray-600 dark:fill-gray-100'

// ❌ Wrong - too dark in light mode
className = 'fill-gray-900 dark:fill-gray-100'

// ❌ Wrong - no dark mode support
className = 'fill-gray-500'
```

**Adaptive Text Shadows:**

```tsx
// ✅ Correct - adaptive shadows with small blur
className =
  '[text-shadow:0_0_2px_rgba(255,255,255,0.9)] dark:[text-shadow:0_0_2px_rgba(0,0,0,0.9)]'

// ❌ Wrong - excessive blur creates glow effect
className = '[text-shadow:0_0_6px_rgba(255,255,255,1)]'

// ❌ Wrong - not adaptive
className = '[text-shadow:0_0_2px_white]'
```

**Font Weight:**

```tsx
// ✅ Use bold for better base visibility
className = 'fill-gray-600 dark:fill-gray-100 font-bold'

// For less prominent text, semibold works
className = 'fill-gray-600 dark:fill-gray-100 font-semibold'
```

### Hatched Pattern Colors

Hatched patterns (like recovery penalties) need special consideration:

**CSS Variables Pattern:**

```css
/* Light mode - medium gray works well */
:root {
  --svg-slate-300: #cbd5e1;
}

/* Dark mode - MUST be lighter for visibility */
[data-theme='dark'] {
  --svg-slate-300: #94a3b8; /* Significantly lighter */
}
```

**Why lighter colors in dark mode:**

- Dark backgrounds reduce contrast of medium grays
- Hatched patterns especially suffer from low contrast
- Users reported patterns were "very hard to read" before adjustment
- Lighter grays (#94a3b8 vs #475569) dramatically improve visibility

### Implementation Example

Complete example from `DayDetailView.tsx`:

```tsx
{
  /* Recovery penalty text - desktop view */
}
{
  duration > 5 && (
    <text
      x={x + width / 2}
      y={TIMELINE_Y + BAR_HEIGHT / 2 + 5}
      textAnchor="middle"
      className="pointer-events-none fill-gray-600 text-xs font-bold italic [text-shadow:0_0_2px_rgba(255,255,255,0.9)] dark:fill-gray-100 dark:[text-shadow:0_0_2px_rgba(0,0,0,0.9)]"
    >
      {Math.round(duration)}m
    </text>
  )
}

{
  /* Recovery penalty hatched pattern */
}
;<rect
  x={x}
  y={y}
  width={width}
  height={height}
  fill={`url(#recovery-pattern)`}
  stroke="var(--svg-slate-300)" // Uses adaptive CSS variable
  strokeWidth={1}
  opacity={0.6}
/>
```

### Common Dark Mode Issues & Solutions

**Issue: Text has glowing halo in dark mode**

- **Cause**: Multiple white shadows with high opacity and large blur
- **Solution**: Use single shadow with 2px blur and adaptive color

**Issue: Text too dark in light mode**

- **Cause**: Using `fill-gray-900` or darker
- **Solution**: Use `fill-gray-600` for better balance

**Issue: Hatched patterns invisible in dark mode**

- **Cause**: Pattern stroke color too dark (e.g., #475569)
- **Solution**: Use lighter color in dark mode (e.g., #94a3b8) via CSS variable

**Issue: Text readable but lacks definition**

- **Cause**: Using `font-medium` or normal weight
- **Solution**: Use `font-bold` to improve base visibility

### Testing Checklist

Before committing changes to SVG visualizations:

- [ ] Toggle between light and dark modes
- [ ] Verify text readability in both modes
- [ ] Check hatched pattern visibility
- [ ] Ensure no glowing or halo effects
- [ ] Test on both desktop and mobile views
- [ ] Verify shadows are adaptive (white in light, black in dark)
- [ ] Check that CSS variables are imported in consuming pages
