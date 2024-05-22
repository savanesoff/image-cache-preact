import { HTMLAttributes, useCallback, useState } from 'react';
import { ImgEvent, useImage } from '@cache';
import { StatusBadge } from '@demo/components/StatusBadge';

export type LoadStatusProps = HTMLAttributes<HTMLDivElement>;
/**
 * Uses the useImage hook to listen to the image loader events.
 * Renders the load status and error message.
 */
export const PosterLoadStatus = ({ ...props }: LoadStatusProps) => {
  const [loaded, setLoaded] = useState(false);
  const onLoadend = useCallback(() => {
    setLoaded(true);
  }, []);

  const [progress, setProgress] = useState(0);
  const onProgress = useCallback((event: ImgEvent<'progress'>) => {
    setProgress(Math.round(event.progress * 100));
  }, []);
  useImage({ onLoadend, onProgress });

  return (
    <StatusBadge
      status={loaded ? 'on' : 'off'}
      text={`${progress}%`}
      {...props}
    />
  );
};
