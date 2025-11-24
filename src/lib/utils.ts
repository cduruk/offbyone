import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function calculateWordCountFromHtml(
  html: string | null | undefined,
): number {
  if (!html) return 0
  const textOnly = html.replace(/<[^>]+>/g, '')
  return textOnly.split(/\s+/).filter(Boolean).length
}

export function readingTime(wordCount: number): string {
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200))
  return `${readingTimeMinutes} min read`
}

export function getHeadingMargin(depth: number): string {
  const margins: Record<number, string> = {
    3: 'ml-4',
    4: 'ml-8',
    5: 'ml-12',
    6: 'ml-16',
  }
  return margins[depth] || ''
}

/**
 * Ensures that internal links always have a trailing slash.
 * Preserves query strings and hash fragments in the correct order.
 * Correctly handles hash-based routes where ? appears within the fragment.
 *
 * @param href - The URL to normalize
 * @returns The URL with a trailing slash (if internal and appropriate)
 *
 * @example
 * ensureTrailingSlash('/posts') // => '/posts/'
 * ensureTrailingSlash('/posts/my-post') // => '/posts/my-post/'
 * ensureTrailingSlash('/posts#top') // => '/posts/#top'
 * ensureTrailingSlash('/search?q=test') // => '/search/?q=test'
 * ensureTrailingSlash('/search?q=test#results') // => '/search/?q=test#results'
 * ensureTrailingSlash('/#settings?tab=2') // => '/#settings?tab=2' (hash-based route)
 * ensureTrailingSlash('/posts/') // => '/posts/'
 * ensureTrailingSlash('/rss.xml') // => '/rss.xml' (keeps file extensions as is)
 */
export function ensureTrailingSlash(href: string): string {
  // Don't modify empty strings, external URLs, or anchor-only links
  if (!href || href.startsWith('http') || href.startsWith('#')) {
    return href
  }

  // Find positions of query and hash
  const queryIndex = href.indexOf('?')
  const hashIndex = href.indexOf('#')

  // Determine if we have a real query string (? must come before #, if # exists)
  const hasQuery =
    queryIndex !== -1 && (hashIndex === -1 || queryIndex < hashIndex)
  const hasHash = hashIndex !== -1 && !hasQuery // Only treat # as delimiter if no query before it

  let pathPart: string
  let queryAndHashPart: string | undefined

  if (hasQuery) {
    // Real query string: split at ?
    pathPart = href.substring(0, queryIndex)
    queryAndHashPart = href.substring(queryIndex + 1)
  } else if (hasHash) {
    // Hash fragment (may contain ? inside it): split at #
    pathPart = href.substring(0, hashIndex)
    queryAndHashPart = href.substring(hashIndex + 1)
  } else {
    // No query or hash
    pathPart = href
    queryAndHashPart = undefined
  }

  // Don't add trailing slash to files with extensions (like .xml, .pdf, etc.)
  // or if the path already has a trailing slash
  if (pathPart.endsWith('/') || /\.[a-z]+$/i.test(pathPart)) {
    return href
  }

  // Add trailing slash to the path
  const normalizedPath = `${pathPart}/`

  // Reattach query/hash with appropriate separator (skip if empty)
  if (!queryAndHashPart || queryAndHashPart === '') {
    return normalizedPath
  }

  // If we had a query string, reattach with ?
  if (hasQuery) {
    return `${normalizedPath}?${queryAndHashPart}`
  }

  // Otherwise, it was a hash, reattach with #
  return `${normalizedPath}#${queryAndHashPart}`
}
