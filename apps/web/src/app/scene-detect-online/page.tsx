import { Playground } from '@/components/Playground';

export const metadata = {
  title: 'Scene Detect Online — ClipTools',
  description: 'Shot-boundary and scene-change detection with JSON timestamps.',
};

export default function SceneDetectPage() {
  return <Playground defaultTab="shots" />;
}
