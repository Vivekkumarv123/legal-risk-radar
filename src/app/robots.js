/**
 * Next.js App Router Robots.txt Generator
 * Automatically generates /robots.txt referencing /sitemap.xml
 */
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legalriskradar.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/pages/settings', '/pages/shared-chats'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
