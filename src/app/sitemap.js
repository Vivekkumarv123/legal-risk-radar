/**
 * Next.js App Router Sitemap Generator
 * Automatically generates /sitemap.xml for search engine indexing.
 */
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legalriskradar.com';

  // Define public and indexed routes in the application
  const routes = [
    { url: '', changeFrequency: 'daily', priority: 1.0 },
    { url: '/pages/home', changeFrequency: 'daily', priority: 1.0 },
    { url: '/pages/features', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/pages/pricing', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/pages/legal-consultation', changeFrequency: 'daily', priority: 0.8 },
    { url: '/pages/legal-doc-generator', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/pages/tools', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/pages/chat', changeFrequency: 'daily', priority: 0.7 },
    { url: '/pages/login', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/pages/signup', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/pages/help-center', changeFrequency: 'monthly', priority: 0.5 },
    { url: '/pages/feedback', changeFrequency: 'monthly', priority: 0.4 },
    { url: '/pages/release-notes', changeFrequency: 'weekly', priority: 0.5 },
    { url: '/pages/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
    { url: '/pages/terms-of-service', changeFrequency: 'yearly', priority: 0.3 },
    { url: '/pages/terms-policies', changeFrequency: 'yearly', priority: 0.3 },
    { url: '/pages/report-bug', changeFrequency: 'monthly', priority: 0.3 },
    { url: '/pages/subscription', changeFrequency: 'monthly', priority: 0.5 }
  ];

  const currentDate = new Date().toISOString();

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
