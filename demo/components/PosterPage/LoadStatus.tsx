import { BucketEvent, useBucket } from '@cache';
import { useCallback, useState } from 'preact/compat';
import { StatusBadge } from '../StatusBadge';

export const PageLoadStatus = () => {
  const [progress, setProgress] = useState(0);
  const onProgress = useCallback((event: BucketEvent<'progress'>) => {
    setProgress(Math.round(event.progress * 100));
  }, []);
  const onLoadend = useCallback(() => {
    setProgress(100);
  }, []);
  useBucket({ onProgress, onLoadend });
  return (
    <StatusBadge
      status={progress !== 100 ? 'off' : 'on'}
      text={`load ${progress}%`}
    />
  );
};
