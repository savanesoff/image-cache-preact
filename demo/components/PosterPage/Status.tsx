import { BucketEvent, useBucket } from '@cache';
import { useCallback, useState } from 'preact/compat';

export const PageStatus = () => {
  const [loadStatus, setLoadStatus] = useState<'loading' | 'loaded'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState<'Yes' | 'No'>('No');
  const onError = useCallback((event: BucketEvent<'error'>) => {
    setError(event.statusText);
  }, []);

  const onProgress = useCallback((event: BucketEvent<'progress'>) => {
    setLoadStatus(event.progress < 1 ? 'loading' : 'loaded');
  }, []);

  const onRendered = useCallback(() => {
    setRendered('Yes');
  }, []);

  useBucket({ onProgress, onError, onRendered });
  return (
    <>
      {error ? <div>Error: {error}</div> : null}
      <div>Status: {loadStatus}</div>
      <div>Rendered: {rendered}</div>
    </>
  );
};
