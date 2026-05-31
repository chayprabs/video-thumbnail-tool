import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://github.com/chayprabs/video-thumbnail-tool';
  const routes = [
    '',
    '/privacy',
    '/terms',
    '/video-trim-online',
    '/video-thumbnail-generator',
    '/video-sprite-sheet',
    '/scene-detect-online',
    '/video-contact-sheet',
  ];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));
}
