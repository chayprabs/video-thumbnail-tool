import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { SeoBar } from '@/components/SeoBar';
import { Footer } from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClipTools — Online Video Trim, Thumbnails & Sprite Sheets',
  description:
    'Trim, concat, remux video and generate thumbnails, contact sheets, sprite sheets and shot boundaries online with FFmpeg.',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <TopBar />
        <SeoBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
