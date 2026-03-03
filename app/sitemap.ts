import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://la-permit-copilot.vercel.app';
  
  const files = fs.readdirSync(path.join((process as any).cwd(), 'content/guides'));
  const guides = files.map((filename) => ({
    url: `${baseUrl}/guides/${filename.replace('.mdx', '')}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...guides,
  ];
}