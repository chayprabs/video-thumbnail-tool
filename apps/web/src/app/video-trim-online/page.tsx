import { Playground } from '@/components/Playground';

export const metadata = {
  title: 'Video Trim Online — ClipTools',
  description: 'Trim video online with FFmpeg stream-copy. Frame-accurate in/out timecodes.',
};

export default function VideoTrimPage() {
  return <Playground defaultTab="trim" />;
}
