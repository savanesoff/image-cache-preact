import { HTMLAttributes, useCallback, useState } from 'react';
import { useImage, UseImageEvent } from '@cache';

export type ProgressProps = HTMLAttributes<HTMLDivElement>;
/**
 * Uses the useImage hook to listen to the image loader events.
 * To render the progress of the image loading.
 * This is done is separate component to isolate re-rendering due to progress updates.
 */
export const PosterProgress = ({ ...props }: ProgressProps) => {
  const [progress, setProgress] = useState(0);
  const onProgress = useCallback((event: UseImageEvent<'progress'>) => {
    setProgress(event.progress);
  }, []);
  useImage({ onProgress });
  return <div {...props}>Progress: {progress}</div>;
};
