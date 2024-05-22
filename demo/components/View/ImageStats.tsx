import { ControllerEvent, useController } from '@cache';
import { useCallback, useState } from 'react';
import { StatusBadge } from '@demo/components';

export const ImageStats = () => {
  const [imageCount, setImageCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  const onUpdate = useCallback((event: ControllerEvent<'update'>) => {
    setImageCount(event.target.cache.size);
    setRequestCount(event.target.getRenderRequestCount());
  }, []);

  useController({
    onUpdate,
  });

  return (
    <>
      <StatusBadge text={`I: ${imageCount}`} />;
      <StatusBadge text={`R: ${requestCount}`} />;
    </>
  );
};
