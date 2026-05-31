import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { SeoBar } from '@/components/SeoBar';
import { Footer } from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClipTools — Online Video Trim, Thumbnails & Sprite Sheets',
  description:
    'Trim, concat, remux video and generate thumbnails, contact sheets, sprite sheets and shot boundaries online with FFmpeg.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  keywords: [
    'video',
    'ffmpeg',
    'video-thumbnail',
    'contact-sheet',
    'sprite-sheet',
    'webvtt',
    'shot-detection',
    'video-trim',
    'video-tools',
  ],
  openGraph: {
    title: 'ClipTools',
    description:
      'Trim, concat, remux video and generate thumbnails, contact sheets, sprite sheets online.',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ClipTools',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Trim, concat, remux video and generate thumbnails, contact sheets, sprite sheets and shot boundaries online with FFmpeg.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <TopBar />
        <SeoBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
