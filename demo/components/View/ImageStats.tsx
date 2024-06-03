import { ControllerEvent, useController } from '@cache';
import { useCallback, useState } from 'react';
import { StatusBadge } from '@demo/components';

export const ImageStats = () => {
  const [imageCount, setImageCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [requestRendered, setRequestRendered] = useState(0);

  const onUpdate = useCallback((event: ControllerEvent<'update'>) => {
    const data = event.target.getRequestsStats();
    setImageCount(event.target.cache.size);
    setRequestCount(data.total);
    setRequestRendered(data.rendered);
  }, []);

  useController({
    onUpdate,
  });

  return (
    <>
      <StatusBadge text={`Images: ${imageCount}`} />
      <StatusBadge text={`Requests: ${requestCount}`} />
      <StatusBadge text={`Rendered: ${requestRendered} `} />
    </>
  );
};
