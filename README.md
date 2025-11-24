# Off by One

Off by One is Can Duruk's home on the internet for long-form essays about engineering, leadership, and the business of building software. This repository contains the Astro codebase that powers the production site at [justoffbyone.com](https://justoffbyone.com).

> **Looking for the upstream theme docs?**
> The template's original README now lives in [`README.theme.md`](./README.theme.md) so contributors can still reference its component gallery and customization notes.

## Quick links

- **Website:** <https://justoffbyone.com>
- **RSS feed:** <https://justoffbyone.com/rss.xml>
- **Newsletter:** <https://justoffbyone.com/subscribe>

## What you'll find here

- Opinionated takes on engineering management and the culture of shipping software.
- Deep dives into the workflows, tools, and processes that keep teams effective.
- Occasional notes on books, conferences, and personal experiments that influence Can's work.

## Tech stack at a glance

- **Astro** for static-site generation with islands architecture where interactive React components are needed.
- **Tailwind CSS** plus a Flexoki-inspired design token system defined in `src/styles/global.css`.
- **shadcn/ui** patterns for the React-based components under `src/components/ui/` that power things like callouts and OG image templates.
- **MDX** content collections validated via Zod schemas in `src/content.config.ts`.
- **Expressive Code/Shiki** for beautiful, themeable code fences across blog posts.

## Repository tour

| Area                    | Highlights                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/consts.ts`         | Site-wide metadata: title, description, nav links, social accounts, and lucide icon mapping for quick updates.            |
| `src/content/`          | MDX content grouped into blog posts, authors, and projects. Schemas in `src/content.config.ts` enforce frontmatter shape. |
| `src/lib/data-utils.ts` | Helper functions that load collections, sort posts/subposts, compute reading time, and assemble TOCs.                     |
| `src/lib/utils.ts`      | Shared utilities including `ensureTrailingSlash()` for consistent internal link formatting and SEO optimization.          |
| `src/components/`       | Astro building blocks for layout (header, footer, breadcrumbs) and long-form affordances (callouts, TOC).                 |
| `src/components/ui/`    | React islands, OG image templates, and shared UI primitives powered by class-variance-authority.                          |
| `src/pages/`            | File-based routes for the homepage, archives, post detail pages, About, and subscription flows.                           |
| `public/`               | Static assets bundled with the site: favicons, fonts, OG fallbacks, showcase imagery.                                     |
| `scripts/`              | TypeScript automation for scaffolding posts, generating OG assets, and keeping favicon/logo variants current.             |

## Local development workflow

1. Install dependencies (Node.js 20+ is recommended):

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   Visit <http://localhost:1234> to browse the site locally. Astro's file-based routing automatically rebuilds pages when you edit content or components.

3. Run linting and formatting to ensure code quality:

   ```bash
   npm run lint        # Check for code quality issues
   npm run lint:fix    # Auto-fix linting issues
   npm run format      # Format code with Prettier
   npm run format:check # Check formatting without modifying files
   ```

   The project uses ESLint 9 (flat config) for code quality checks and Prettier for formatting. Both tools are configured to work with TypeScript, React, and Astro files.

4. Before submitting a pull request, run the production build to ensure linting, content validation, OG generation, and type checking all pass:

   ```bash
   npm run build
   ```

   The build process automatically runs `npm run lint` first, then generates OG images, runs Astro type checking, and builds the site. The build output lives in `dist/`; Astro will surface frontmatter or MDX errors directly in the console.

5. Run tests to verify utility functions and ensure code quality:

   ```bash
   npm test          # Watch mode for development
   npm run test:run  # Single run for CI/CD
   npm run test:ui   # Interactive UI mode
   ```

## Publishing new writing

1. Scaffold the post and its OG assets using the generator. It now supports both interactive prompts and direct CLI flags for automation workflows:

   ```bash
   # Interactive
   npm run new-post

   # Non-interactive example
   npm run new-post -- --title "My Post" --description "Teaser" --tags engineering,process --draft --author cduruk
   ```

2. Drafts are created under `src/content/blog/`. Iterate locally with the dev server until you're ready to ship, then set `draft: false` in the frontmatter.

3. Keep author metadata current in `src/content/authors/`; posts render bylines and social links from this collection.

4. If a post needs bespoke OG imagery, edit the matching template under `src/components/ui/og/` and run:

   ```bash
   # Default: fill in any missing blog or static page assets
   npm run generate-og-images

   # Force-regenerate a specific post and skip static pages
   npm run generate-og-images -- --slug my-post --all-posts --no-static

   # Run just the static page task
   npm run generate-og-images -- --tasks static
   ```

   The CLI accepts multiple slugs (comma separated or repeated `--slug` flags) and `--tasks posts,static` to pick the work queue explicitly.

5. Commit the generated assets stored in `public/og/` so deployments stay in sync.

## URL conventions and trailing slashes

All internal links throughout the site use **trailing slashes** for consistency and SEO optimization. This prevents unnecessary redirects and ensures canonical URLs are properly recognized by search engines.

### How it works

The `ensureTrailingSlash()` utility function in `src/lib/utils.ts` automatically:

- Adds trailing slashes to internal paths: `/posts` → `/posts/`
- Preserves hash fragments correctly: `/posts#top` → `/posts/#top`
- Leaves file extensions unchanged: `/rss.xml` stays `/rss.xml`
- Ignores external URLs and anchor-only links

### Where it's applied

- **Link component** (`src/components/Link.astro`) - Automatically normalizes all internal links
- **Navigation constants** (`src/consts.ts`) - All nav and social links use trailing slashes
- **Breadcrumbs** - Dynamic breadcrumb paths in all page templates
- **Pagination** - Post listing pagination links
- **Component links** - BlogCard, PostNavigation, TOCSidebar, SubpostsSidebar, AuthorCard

### Testing

The trailing slash logic is covered by 29 parameterized tests in `src/lib/utils.test.ts`. Run `npm test` to verify behavior when modifying URL-related code.

## Content and code conventions

- Favor prose-friendly Markdown: wrap paragraphs at a sensible width, use fenced code blocks with explicit language identifiers, and rely on MDX components (callouts, tables, tabsets) for richer layouts.
- When building new pages, reuse helpers from `src/lib/data-utils.ts` so archive ordering, table-of-contents generation, and subpost navigation remain consistent.
- Treat `src/consts.ts` as the single source of truth for navigation and site metadata.
- Run `npm run build`—and any related targeted scripts—before merging changes that affect content, components, or configuration.

## Additional resources

- [`README.theme.md`](./README.theme.md) retains the astro-erudite template's gallery, configuration notes, and upstream changelog.
- The [`scripts/README.md`](./scripts/README.md) file documents each automation script, required environment variables, and common troubleshooting steps.

## License

The code in this repository inherits the template's [MIT License](./LICENSE). Individual posts are © their respective authors.
