import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import satori from 'satori'
import sharp from 'sharp'
import { Resvg } from '@resvg/resvg-js'
import { createElement } from 'react'
import { HeroTemplate } from '../src/components/ui/hero-template.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BLOG_DIR = join(__dirname, '../src/content/blog')
const OUTPUT_WIDTH = 1200
const OUTPUT_HEIGHT = 630

interface Frontmatter {
  [key: string]: string
}

export interface BlogPost {
  slug: string
  dir: string
  hasOgImage: boolean
  title?: string
  description?: string
  draft?: string
}

interface StaticPage {
  name: string
  title: string
  description?: string
  outputPath: string
}

export interface CliOptions {
  slugs: string[]
  includePosts: boolean
  includeStatic: boolean
  onlyMissing: boolean
  help: boolean
}

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function normalizeSlugInput(value: string | undefined): string[] {
  if (!value) {
    return []
  }

  return parseList(value)
}

function takeValue(
  valueFromSame: string | undefined,
  args: string[],
  index: number,
): { consumed: number; value?: string } {
  if (valueFromSame !== undefined) {
    return { consumed: 0, value: valueFromSame }
  }

  const next = args[index + 1]

  if (next && !next.startsWith('--')) {
    return { consumed: 1, value: next }
  }

  return { consumed: 0 }
}

export function parseCliArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    slugs: [],
    includePosts: true,
    includeStatic: true,
    onlyMissing: true,
    help: false,
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (!arg.startsWith('--')) {
      continue
    }

    // eslint-disable-next-line prefer-const
    let [rawKey, valueFromSame] = arg.slice(2).split('=', 2)

    if (!rawKey) {
      continue
    }

    if (rawKey === 'h') {
      rawKey = 'help'
    }

    if (rawKey === 'help') {
      options.help = true
      continue
    }

    if (rawKey.startsWith('no-')) {
      const normalizedKey = rawKey.slice(3)

      if (normalizedKey === 'static') {
        options.includeStatic = false
      } else if (normalizedKey === 'posts') {
        options.includePosts = false
      }

      continue
    }

    const { consumed, value } = takeValue(valueFromSame, args, index)
    index += consumed

    switch (rawKey) {
      case 'slug':
      case 'slugs': {
        const slugs = normalizeSlugInput(value)

        if (slugs.length === 0) {
          throw new Error('The --slug flag requires at least one slug value.')
        }

        const existing = new Set(options.slugs)

        for (const slug of slugs) {
          if (!existing.has(slug)) {
            options.slugs.push(slug)
            existing.add(slug)
          }
        }

        break
      }
      case 'tasks':
      case 'task': {
        if (!value) {
          throw new Error('The --tasks flag requires a comma-separated value.')
        }

        const normalized = parseList(value)

        if (normalized.length === 0) {
          throw new Error('Provide at least one task: posts, static, or both.')
        }

        let posts = false
        let statics = false

        for (const task of normalized) {
          if (task === 'posts' || task === 'post') {
            posts = true
          } else if (task === 'static' || task === 'statics') {
            statics = true
          } else {
            throw new Error(`Unknown task "${task}". Use "posts" or "static".`)
          }
        }

        options.includePosts = posts
        options.includeStatic = statics
        break
      }
      case 'posts-only': {
        options.includePosts = true
        options.includeStatic = false
        break
      }
      case 'static-only': {
        options.includePosts = false
        options.includeStatic = true
        break
      }
      case 'include-static': {
        options.includeStatic = true
        break
      }
      case 'include-posts': {
        options.includePosts = true
        break
      }
      case 'all-posts':
      case 'force': {
        options.onlyMissing = false
        break
      }
      case 'missing-only': {
        options.onlyMissing = true
        break
      }
      default:
        break
    }
  }

  return options
}

export function filterPostsForGeneration(
  posts: BlogPost[],
  options: CliOptions,
): BlogPost[] {
  if (options.slugs.length > 0) {
    const slugSet = new Set(options.slugs)
    const selected = posts.filter((post) => slugSet.has(post.slug))

    const missing = options.slugs.filter(
      (slug) => !selected.some((post) => post.slug === slug),
    )

    if (missing.length > 0) {
      throw new Error(
        `Unknown blog post slug${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
      )
    }

    return selected
  }

  return posts.filter((post) => {
    if (post.draft === 'true') {
      return false
    }

    if (options.onlyMissing) {
      return !post.hasOgImage
    }

    return true
  })
}

// Simple frontmatter parser
function parseFrontmatter(content: string): Frontmatter | null {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/
  const match = content.match(frontmatterRegex)

  if (!match) return null

  const frontmatter: Frontmatter = {}
  const lines = match[1].split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.slice(0, colonIndex).trim()
    let value = line.slice(colonIndex + 1).trim()

    // Remove quotes
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1)
    }

    frontmatter[key] = value
  }

  return frontmatter
}

// Get all blog posts
async function getBlogPosts(): Promise<BlogPost[]> {
  const entries = await readdir(BLOG_DIR, { withFileTypes: true })
  const posts: BlogPost[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const postDir = join(BLOG_DIR, entry.name)
    const files = await readdir(postDir)

    // Find index.mdx or index.md
    const indexFile = files.find((f) => f === 'index.mdx' || f === 'index.md')
    if (!indexFile) continue

    // Check if OG image already exists
    const hasOgImage = files.some((f) => f.startsWith('og-image.'))

    const content = await readFile(join(postDir, indexFile), 'utf-8')
    const frontmatter = parseFrontmatter(content)

    if (!frontmatter) continue

    posts.push({
      slug: entry.name,
      dir: postDir,
      hasOgImage,
      ...frontmatter,
    })
  }

  return posts
}

// Generate OG image for a specific post by slug
export async function generateImageForSlug(slug: string): Promise<void> {
  const postDir = join(BLOG_DIR, slug)

  try {
    const files = await readdir(postDir)

    // Find index.mdx or index.md
    const indexFile = files.find((f) => f === 'index.mdx' || f === 'index.md')
    if (!indexFile) {
      throw new Error(`No index.mdx or index.md found in ${slug}`)
    }

    const content = await readFile(join(postDir, indexFile), 'utf-8')
    const frontmatter = parseFrontmatter(content)

    if (!frontmatter) {
      throw new Error(`No frontmatter found in ${slug}/${indexFile}`)
    }

    const post: BlogPost = {
      slug,
      dir: postDir,
      hasOgImage: files.some((f) => f.startsWith('og-image.')),
      ...frontmatter,
    }

    await generateImage(post)
  } catch (error) {
    throw new Error(
      `Failed to generate OG image for ${slug}: ${(error as Error).message}`,
    )
  }
}

// Generate image for a post
export async function generateImage(post: BlogPost): Promise<void> {
  console.log(`Generating image for: ${post.title}`)

  // Create React element using the TSX component
  const element = createElement(HeroTemplate, {
    title: post.title || 'Untitled',
    description: post.description,
  })

  // Generate SVG using Satori
  const svg = await satori(element, {
    width: OUTPUT_WIDTH,
    height: OUTPUT_HEIGHT,
    fonts: [
      {
        name: 'Fira Sans',
        data: await readFile(
          join(
            __dirname,
            '../node_modules/@fontsource/fira-sans/files/fira-sans-latin-400-normal.woff',
          ),
        ),
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Fira Sans',
        data: await readFile(
          join(
            __dirname,
            '../node_modules/@fontsource/fira-sans/files/fira-sans-latin-700-normal.woff',
          ),
        ),
        weight: 700,
        style: 'normal',
      },
    ],
  })

  // Convert SVG to PNG using resvg
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: OUTPUT_WIDTH,
    },
  })

  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  // Optimize with sharp
  const optimizedBuffer = await sharp(pngBuffer)
    .png({ quality: 90, compressionLevel: 9 })
    .toBuffer()

  // Write to post directory as OG image
  const outputPath = join(post.dir, 'og-image.png')
  await writeFile(outputPath, optimizedBuffer)

  console.log(`✓ Generated: ${outputPath}`)
}

// Define static pages to generate OG images for
function getStaticPages(): StaticPage[] {
  const OG_DIR = join(__dirname, '../public/static/og')

  return [
    {
      name: 'about',
      title: 'About',
      description:
        'My name is Can Duruk. I am the former CTO and co-founder of Felt.',
      outputPath: join(OG_DIR, 'about.png'),
    },
    {
      name: 'subscribe',
      title: 'Subscribe to Off by One',
      description: 'Get new posts delivered directly to your inbox.',
      outputPath: join(OG_DIR, 'subscribe.png'),
    },
    {
      name: 'tags',
      title: 'Tags',
      description:
        'Browse posts by topic. Each tag shows how many posts are tagged with it.',
      outputPath: join(OG_DIR, 'tags.png'),
    },
  ]
}

// Generate image for a static page
async function generateStaticPageImage(page: StaticPage): Promise<void> {
  console.log(`  Generating OG image for: ${page.name}`)

  // Ensure the og directory exists
  const ogDir = dirname(page.outputPath)
  await mkdir(ogDir, { recursive: true })

  // Create React element using the TSX component
  const element = createElement(HeroTemplate, {
    title: page.title,
    description: page.description,
  })

  // Generate SVG using Satori
  const svg = await satori(element, {
    width: OUTPUT_WIDTH,
    height: OUTPUT_HEIGHT,
    fonts: [
      {
        name: 'Fira Sans',
        data: await readFile(
          join(
            __dirname,
            '../node_modules/@fontsource/fira-sans/files/fira-sans-latin-400-normal.woff',
          ),
        ),
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Fira Sans',
        data: await readFile(
          join(
            __dirname,
            '../node_modules/@fontsource/fira-sans/files/fira-sans-latin-700-normal.woff',
          ),
        ),
        weight: 700,
        style: 'normal',
      },
    ],
  })

  // Convert SVG to PNG using resvg
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: OUTPUT_WIDTH,
    },
  })

  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  // Optimize with sharp
  const optimizedBuffer = await sharp(pngBuffer)
    .png({ quality: 90, compressionLevel: 9 })
    .toBuffer()

  // Write to public/static/og directory
  await writeFile(page.outputPath, optimizedBuffer)

  console.log(`  ✓ Generated OG image: /static/og/${page.name}.png`)
}

function printUsage(): void {
  console.log(`Usage: npm run generate-og-images -- [options]

Options:
  --slug slug-one,slug-two   Generate OG images for specific blog post slugs
  --tasks posts,static       Choose which tasks to run (posts, static)
  --posts-only               Shorthand for "--tasks posts"
  --static-only              Shorthand for "--tasks static"
  --no-posts                 Skip blog post generation
  --no-static                Skip static page generation
  --all-posts | --force      Regenerate posts even if an OG image exists
  --missing-only             Revert to the default missing-only behaviour
  --help                     Show this message
`)
}

export async function runCli(options: CliOptions): Promise<void> {
  console.log('🎨 Generating OG images...\n')

  const shouldGeneratePosts = options.includePosts || options.slugs.length > 0

  if (shouldGeneratePosts) {
    console.log('📝 Blog posts:')
    const posts = await getBlogPosts()
    const postsToGenerate = filterPostsForGeneration(posts, options)

    if (postsToGenerate.length === 0) {
      if (options.slugs.length > 0) {
        console.log('  ✨ No matching posts found for the provided slugs.')
      } else if (options.onlyMissing) {
        console.log('  ✨ All posts already have OG images!')
      } else {
        console.log('  ✨ No posts matched the generation criteria.')
      }
    } else {
      if (options.onlyMissing && options.slugs.length === 0) {
        console.log(
          `  Found ${postsToGenerate.length} posts without OG images:\n`,
        )
      }

      for (const post of postsToGenerate) {
        try {
          await generateImage(post)
        } catch (error) {
          console.error(
            `  ✗ Failed to generate OG image for ${post.slug}:`,
            (error as Error).message,
          )
        }
      }
    }
  }

  if (options.includeStatic) {
    console.log(shouldGeneratePosts ? '\n📄 Static pages:' : '📄 Static pages:')
    const staticPages = getStaticPages()

    for (const page of staticPages) {
      try {
        await generateStaticPageImage(page)
      } catch (error) {
        console.error(
          `  ✗ Failed to generate OG image for ${page.name}:`,
          (error as Error).message,
        )
      }
    }
  }

  console.log('\n✅ Done!')
}

// Only run main if this file is being executed directly (not imported)
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const options = parseCliArgs(process.argv.slice(2))

  if (options.help) {
    printUsage()
  } else if (
    !options.includePosts &&
    !options.includeStatic &&
    options.slugs.length === 0
  ) {
    console.error('Nothing to do. Specify --slug or enable posts/static tasks.')
    process.exitCode = 1
  } else {
    runCli(options).catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exitCode = 1
    })
  }
}
