import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: ['/dashboard', '/login', '/signup', '/auth', '/api', '/forms'],
    },
  }
}
