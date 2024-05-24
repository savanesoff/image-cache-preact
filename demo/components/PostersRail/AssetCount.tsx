import { useBucket, BucketEvent } from '@cache';
import { useState, useCallback } from 'preact/compat';
import { StatusBadge } from '../StatusBadge/StatusBadge';

export const AssetCount = () => {
  const [imageCount, setImageCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const onUpdate = useCallback((event: BucketEvent<'update'>) => {
    setImageCount(event.images);
    setRequestCount(event.requests);
  }, []);
  useBucket({ onUpdate });
  return (
    <>
      <StatusBadge text={`I: ${imageCount}`} />
      <StatusBadge text={`R: ${requestCount}`} />
    </>
  );
};
