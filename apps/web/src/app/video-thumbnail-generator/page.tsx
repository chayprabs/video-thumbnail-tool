import { Playground } from '@/components/Playground';

export const metadata = {
  title: 'Video Thumbnail Generator — ClipTools',
  description: 'Generate video thumbnails at timecode, strips, and scene-aware poster frames.',
};

export default function ThumbnailPage() {
  return <Playground defaultTab="thumbnail" />;
}
