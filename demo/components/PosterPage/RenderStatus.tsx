import { BucketEvent, useBucket } from '@cache';
import { useCallback, useState } from 'preact/compat';
import { StatusBadge } from '../StatusBadge';

export const PageRenderStatus = () => {
  const [progress, setProgress] = useState(0);

  const onRenderProgress = useCallback(
    (event: BucketEvent<'render-progress'>) => {
      setProgress(Math.round(event.progress * 100));
    },
    [],
  );

  useBucket({ onRenderProgress });
  return (
    <StatusBadge
      status={progress === 100 ? 'warn' : 'off'}
      text={`render ${progress}%`}
    />
  );
};
