import { mkdir, writeFile, readdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'
import { generateImageForSlug } from './generate-og-images.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BLOG_DIR = join(__dirname, '../src/content/blog')
const DEFAULT_AUTHOR = 'cduruk'
const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY)

let rl: readline.Interface | undefined

// Lazily create readline interface
function getReadline(): readline.Interface {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
  }

  return rl
}

function closeReadline(): void {
  if (rl) {
    rl.close()
    rl = undefined
  }
}

// Promisified question function
function question(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isInteractive) {
      reject(
        new Error(
          'Cannot prompt for input in non-interactive mode. Please provide required values via CLI flags.',
        ),
      )
      return
    }

    getReadline().question(prompt, resolve)
  })
}

interface CliOptions {
  title?: string
  description?: string
  tags?: string
  author?: string
  draft?: boolean
  date?: string
  slug?: string
  help?: boolean
}

function parseArgs(args: string[]): CliOptions {
  const result: CliOptions = {}

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (!arg.startsWith('--')) {
      continue
    }

    const [rawKey, valueFromSame] = arg.slice(2).split('=', 2)

    if (!rawKey) {
      continue
    }

    if (rawKey === 'help' || rawKey === 'h') {
      result.help = true
      continue
    }

    if (rawKey.startsWith('no-')) {
      const normalizedKey = rawKey.slice(3)

      if (normalizedKey === 'draft') {
        result.draft = false
      }

      continue
    }

    let value = valueFromSame

    if (
      value === undefined &&
      index + 1 < args.length &&
      !args[index + 1].startsWith('--')
    ) {
      value = args[index + 1]
      index += 1
    }

    switch (rawKey) {
      case 'title':
        result.title = value ?? ''
        break
      case 'description':
        result.description = value ?? ''
        break
      case 'tags':
        result.tags = value ?? ''
        break
      case 'author':
        result.author = value ?? ''
        break
      case 'date':
        result.date = value ?? ''
        break
      case 'slug':
        result.slug = value ?? ''
        break
      case 'draft':
        if (value === undefined) {
          result.draft = true
        } else {
          result.draft = !['false', '0', 'no'].includes(value.toLowerCase())
        }
        break
      default:
        break
    }
  }

  return result
}

function printUsage(): void {
  console.log(`Usage: npm run new-post -- [options]

Options:
  --title "Post title"           Required when running non-interactively
  --description "Description"     Required when running non-interactively
  --tags "tag-one,tag-two"        Optional comma-separated tags
  --author "username"             Optional author override (default: ${DEFAULT_AUTHOR})
  --draft | --no-draft            Mark post as draft (defaults to no)
  --date YYYY-MM-DD              Override the creation date
  --slug custom-slug             Provide a custom slug
  --help                         Show this message
`)
}

function parseTags(input?: string): string[] {
  if (!input) {
    return []
  }

  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

function escapeYamlString(value: string): string {
  return value.replace(/"/g, '\\"')
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Generate frontmatter
function generateFrontmatter(data: {
  title: string
  description: string
  date: string
  tags?: string[]
  author: string
  draft: boolean
}): string {
  const lines: string[] = ['---']

  lines.push(`title: "${escapeYamlString(data.title)}"`)
  lines.push(`description: "${escapeYamlString(data.description)}"`)
  lines.push(`date: ${data.date}`)

  if (data.tags && data.tags.length > 0) {
    lines.push(
      `tags: [${data.tags.map((tag) => `"${escapeYamlString(tag)}"`).join(', ')}]`,
    )
  }

  lines.push(`ogImage: './og-image.png'`)
  lines.push(`authors: ["${escapeYamlString(data.author)}"]`)

  if (data.draft) {
    lines.push(`draft: true`)
  }

  lines.push('---')

  return lines.join('\n')
}

// Generate post content
function generatePostContent(data: {
  title: string
  description: string
  date: string
  tags?: string[]
  author: string
  draft: boolean
}): string {
  const frontmatter = generateFrontmatter(data)

  return `${frontmatter}

import Callout from '@/components/Callout.astro'

## Introduction

Your content here...
`
}

// Check if directory exists
async function directoryExists(slug: string): Promise<boolean> {
  try {
    const entries = await readdir(BLOG_DIR, { withFileTypes: true })
    return entries.some((entry) => entry.isDirectory() && entry.name === slug)
  } catch {
    return false
  }
}

// Main function
async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    printUsage()
    return
  }

  console.log('📝 Create New Blog Post\n')

  // Get title (required)
  let title = (args.title ?? '').trim()
  while (!title) {
    try {
      title = (await question('Post title: ')).trim()
    } catch (_) {
      console.error(
        '❌ Title is required. Provide it with --title when running non-interactively.',
      )
      process.exit(1)
    }

    if (!title) {
      console.log('⚠️  Title is required!\n')
    }
  }

  // Generate and confirm slug
  const slugSource =
    args.slug && args.slug.trim().length > 0 ? args.slug : title
  const slug = generateSlug(slugSource)

  if (args.slug && args.slug.trim().length > 0) {
    console.log(`Using provided slug: ${slug}\n`)
  } else {
    console.log(`Generated slug: ${slug}\n`)
  }

  // Check if post already exists
  if (await directoryExists(slug)) {
    console.log(`❌ A post with slug "${slug}" already exists!`)
    closeReadline()
    return
  }

  // Get description (required)
  let description = (args.description ?? '').trim()
  while (!description) {
    try {
      description = (await question('Description: ')).trim()
    } catch (_) {
      console.error(
        '❌ Description is required. Provide it with --description when running non-interactively.',
      )
      process.exit(1)
    }

    if (!description) {
      console.log('⚠️  Description is required!\n')
    }
  }

  // Get tags (optional)
  let tags: string[]

  if (args.tags !== undefined) {
    tags = parseTags(args.tags)
  } else if (isInteractive) {
    const tagsInput = await question(
      'Tags (comma-separated, or press enter to skip): ',
    )
    tags = parseTags(tagsInput)
  } else {
    tags = []
  }

  // Get draft status (optional)
  let draft = args.draft

  if (draft === undefined) {
    if (isInteractive) {
      const draftInput = await question('Create as draft? (y/N): ')
      draft =
        draftInput.toLowerCase() === 'y' || draftInput.toLowerCase() === 'yes'
    } else {
      draft = false
    }
  }

  closeReadline()

  const date =
    args.date && args.date.trim().length > 0
      ? args.date
      : formatDate(new Date())
  const author =
    args.author && args.author.trim().length > 0 ? args.author : DEFAULT_AUTHOR

  // Generate content
  const content = generatePostContent({
    title,
    description,
    date,
    tags: tags.length > 0 ? tags : undefined,
    author,
    draft,
  })

  // Create directory and file
  const postDir = join(BLOG_DIR, slug)
  const indexPath = join(postDir, 'index.mdx')

  try {
    await mkdir(postDir, { recursive: true })
    await writeFile(indexPath, content, 'utf-8')

    console.log(`\n✅ Created ${indexPath}`)

    if (draft) {
      console.log('📌 Post created as draft')
    }

    // Generate OG image
    console.log('\n🎨 Generating Open Graph image...')
    try {
      await generateImageForSlug(slug)
      console.log('✅ OG image generated successfully')
    } catch (error) {
      console.error(
        '⚠️  Failed to generate OG image:',
        (error as Error).message,
      )
      console.log(
        '   You can generate it later with: npm run generate-og-images',
      )
    }

    console.log('\n💡 Next steps:')
    console.log(`   1. Edit ${slug}/index.mdx`)
    console.log(`   2. Run "npm run dev" to preview your post`)
  } catch (error) {
    console.error('❌ Failed to create post:', (error as Error).message)
    process.exit(1)
  }
}

main().catch(console.error)
