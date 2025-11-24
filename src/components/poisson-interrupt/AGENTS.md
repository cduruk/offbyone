# Agent Instructions

> **Note:** For project overview, features, and user documentation, see [README.md](README.md).
> This file contains developer-focused context for AI coding assistants.

## Commands

- **Dev**: `npm run dev` (Starts Vite dev server)
- **Build**: `npm run build` (Builds for production)
- **Preview**: `npm run preview` (Previews production build)
- **Typecheck**: `npx tsc --noEmit` (Runs TypeScript type checking)

## Architecture & Structure

- **Stack**: React 19, Vite 6, TypeScript 5.8, Tailwind CSS, Lucide React.
- **Structure**:
  - `components/`: UI components (e.g., `PoissonInterruptionsGrid.tsx` for main visualization).
  - `lib/`: Business logic (e.g., `simulation.ts` for Poisson logic).
  - `App.tsx`: Main entry component.
- **Key Logic**: `simulation.ts` handles `simulateDays` using a seeded RNG and Poisson distribution.
- **Visualization**: Custom SVG implementation in `PoissonInterruptionsGrid.tsx`.

## Code Style & Conventions

- **Naming**: PascalCase for components, camelCase for functions/vars.
- **Types**: Strict TypeScript. Define interfaces (e.g., `DayStats`, `WorkBlock`) in `lib/` or locally.
- **Styling**: Use Tailwind CSS utility classes. Avoid inline styles for layout.
- **Imports**: Group imports: React/Libs -> Internal Logic -> Components -> Assets/Icons.
- **Components**: Functional components with hooks. Avoid class components.
- **Icons**: Use `lucide-react`.

## Git Commit Conventions

This project uses **conventional commits** format for clear, searchable git history.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types

- **feat**: New feature or functionality
- **fix**: Bug fix
- **docs**: Documentation changes only
- **style**: Code style/formatting (no logic changes)
- **refactor**: Code restructuring (no feature changes)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, tooling

### Examples

**Good commits:**
```
feat: add focus blocks heatmap visualization
fix: resolve TypeScript errors after Shadcn integration
docs: update README for code consistency
refactor: centralize color system with CSS variables
style: fix prettier formatting issues
chore: remove .vite build artifacts from version control
```

**Bad commits (avoid):**
```
Fix                    # Too vague - fix what?
Update                 # What was updated?
Changes                # What kind of changes?
WIP                    # Never commit WIP to main
Final changes          # Not descriptive
```

### Guidelines

1. **Be specific**: Describe *what* and *why*, not *how*
2. **Use imperative mood**: "add feature" not "added feature"
3. **Keep subject line under 72 characters**
4. **One logical change per commit**: Separate fixes from features
5. **Reference issues when applicable**: `fix: resolve modal bug (#123)`
6. **Use scope for clarity**: `feat(heatmap): add threshold toggle controls`

### Commit Body (when needed)

Add a body for complex changes:
```
feat: add embeddable React components for external integration

- Create DaysGridEmbed and DayDetailEmbed components
- Add FocusBlocksHeatmapEmbed for heatmap visualization
- Add routing for /embed-grid, /embed-day paths
- Update ASTRO_EMBEDDING_GUIDE.md with component examples

This enables developers to embed visualizations in their own
applications using React components rather than iframes.
```

### What NOT to commit

- Never commit `node_modules/`, `dist/`, or build artifacts (use `.gitignore`)
- Avoid committing `.env` files or secrets
- Don't commit commented-out code (delete it)
- Don't commit debug console.logs (remove them)

### When to commit

- After completing a logical unit of work
- Before switching to a different task
- When tests pass and code is verified
- Never commit broken code to `main` branch

## Pull Request Workflow

**ALWAYS create a Pull Request for changes.** Never push directly to `main`.

### Standard Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes with clean commits:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push to remote:**
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Create Pull Request on GitHub:**
   - Use descriptive PR title (similar to commit message format)
   - Add clear description of what changed and why
   - Reference any related issues
   - Request review if working with others

5. **Before merging, ensure:**
   - ✅ All tests pass (`npm run type-check && npm run lint && npm run build`)
   - ✅ Code is formatted (`npm run format`)
   - ✅ No merge conflicts
   - ✅ PR has been reviewed (if applicable)

6. **Merge the PR:**
   - Use **"Squash and merge"** for feature branches (keeps main clean)
   - Use **"Rebase and merge"** if commits are already well-organized
   - Delete the branch after merging

### Branch Naming Conventions

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/update-description` - Documentation updates
- `refactor/component-name` - Code refactoring
- `chore/task-description` - Maintenance tasks

### PR Title Format

Follow the same conventional commits format:
```
feat(heatmap): add threshold toggle controls
fix(simulation): resolve edge case in Poisson calculation
docs: update embedding guide with new examples
refactor: centralize color system
```

### PR Description Template

```markdown
## Summary
Brief description of what this PR does

## Changes
- List of specific changes made
- Another change
- One more change

## Testing
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Verified simulation consistency
- [ ] Tested in browser

## Screenshots (if applicable)
[Add screenshots for UI changes]
```

### Why Use PRs?

- **Code review**: Catch issues before they reach main
- **Documentation**: PRs create a record of why changes were made
- **Testing**: CI/CD can run automated checks
- **Collaboration**: Team members can discuss changes
- **Safety**: Easy to revert if something goes wrong
- **Quality**: Enforces running tests and checks before merge

### Emergency Hotfixes

Even for urgent fixes, create a PR:
```bash
git checkout -b hotfix/critical-bug
# Make fix
git push -u origin hotfix/critical-bug
# Create PR, get quick review, merge immediately
```

The few extra seconds to create a PR are worth the safety and documentation.
