import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { globSync } from 'glob'

describe('Internal blog post links', () => {
  it('should have trailing slashes on all internal /posts/ links', async () => {
    // Find all MDX files in the blog content directory
    const mdxFiles = globSync('src/content/blog/**/*.mdx', {
      cwd: process.cwd(),
    })

    const errors: Array<{ file: string; line: number; match: string }> = []

    // Check each file for internal links without trailing slashes
    for (const file of mdxFiles) {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        // Match internal /posts/ links that don't have a trailing slash before the closing paren
        // Pattern: /posts/[anything except /])
        const regex = /\/posts\/([^/\s)]+)\)/g
        let match

        while ((match = regex.exec(line)) !== null) {
          errors.push({
            file: file.replace(process.cwd() + '/', ''),
            line: index + 1,
            match: match[0],
          })
        }
      })
    }

    // If we found any errors, format them nicely and fail the test
    if (errors.length > 0) {
      const errorMessage = [
        '\nFound internal /posts/ links without trailing slashes:',
        ...errors.map(
          (e) => `  ${e.file}:${e.line} - "${e.match.replace(')', '')}/)"`,
        ),
        '\nAll internal blog post links should end with a trailing slash before the closing parenthesis.',
      ].join('\n')

      throw new Error(errorMessage)
    }

    expect(errors).toHaveLength(0)
  })
})

describe('Astro page internal links', () => {
  it('should use Link component or ensureTrailingSlash for internal links', async () => {
    // Find all Astro page files
    const astroFiles = globSync('src/pages/**/*.astro', {
      cwd: process.cwd(),
    })

    const errors: Array<{ file: string; line: number; issue: string }> = []

    // Check each file for direct href usage without Link component
    for (const file of astroFiles) {
      const content = readFileSync(file, 'utf-8')

      // Remove all Link component tags to avoid false positives
      // Match <Link...>...</Link> across multiple lines
      const contentWithoutLinkComponents = content.replace(
        /<Link[^>]*>[\s\S]*?<\/Link>/g,
        '',
      )

      const lines = contentWithoutLinkComponents.split('\n')

      lines.forEach((line, index) => {
        // Skip if line uses ensureTrailingSlash
        if (line.includes('ensureTrailingSlash')) {
          return
        }

        // Check for direct <a> tags with internal paths that lack trailing slashes
        // Match patterns like: <a href="/posts/something"
        // But exclude: href="/posts/something/" (already has slash) or href="/rss.xml" (file extension)
        const hrefRegex = /<a[^>]*href=["'`]*(\/[a-z-]+\/[a-z0-9-]+)["'`]/gi
        let match

        while ((match = hrefRegex.exec(line)) !== null) {
          const path = match[1]
          // Only flag if it doesn't end with / and doesn't have a file extension
          if (!path.endsWith('/') && !/\.[a-z]+$/i.test(path)) {
            // Find the actual line number in the original content
            const originalLines = content.split('\n')
            const actualLineNum =
              originalLines.findIndex((l) => l.includes(path)) + 1

            errors.push({
              file: file.replace(process.cwd() + '/', ''),
              line: actualLineNum || index + 1,
              issue: `Direct <a href="${path}"> should use Link component or ensureTrailingSlash()`,
            })
          }
        }
      })
    }

    // If we found any errors, format them nicely and fail the test
    if (errors.length > 0) {
      const errorMessage = [
        '\nFound internal <a> links in Astro pages without proper trailing slash handling:',
        ...errors.map((e) => `  ${e.file}:${e.line} - ${e.issue}`),
        '\nAll internal links should either:',
        '  1. Use the Link component (which automatically adds trailing slashes), or',
        '  2. Use <a> tags with ensureTrailingSlash() wrapping the href value',
      ].join('\n')

      throw new Error(errorMessage)
    }

    expect(errors).toHaveLength(0)
  })
})
