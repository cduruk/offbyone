import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Off by One',
  description:
    'Off by One is where Can Duruk writes about engineering, management, and engineering management.',
  href: 'https://justoffbyone.com',
  author: 'cduruk',
  locale: 'en-US',
  featuredPostCount: 5,
  postsPerPage: 100,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/posts/',
    label: 'posts',
  },
  {
    href: '/tags/',
    label: 'tags',
  },
  {
    href: '/about/',
    label: 'about',
  },
  {
    href: '/subscribe/',
    label: 'subscribe',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://linkedin.com/in/cduruk',
    label: 'LinkedIn',
  },
  {
    href: 'https://x.com/can',
    label: 'Twitter',
  },
  {
    href: 'mailto:can@duruk.net',
    label: 'Email',
  },
  {
    href: '/subscribe/',
    label: 'Subscribe',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  About: 'lucide:info',
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  Subscribe: 'lucide:newspaper',
  RSS: 'lucide:rss',
}
