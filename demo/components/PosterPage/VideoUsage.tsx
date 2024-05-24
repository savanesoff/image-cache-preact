import { BucketVideoUnits, useBucket } from '@cache';
import { useCallback, useState } from 'preact/compat';
import { StatusBadge } from '@demo/components';

export const VideoUsage = () => {
  const [data, setData] = useState<BucketVideoUnits>();

  const { bucket } = useBucket();
  const onRequestRendered = useCallback(() => {
    setData(bucket.getVideoUnits());
  }, [bucket]);
  useBucket({ onRequestRendered });
  return (
    <StatusBadge
      status="warn"
      text={`VID (${data?.type}) r:${data?.requested.toFixed(2)} u:${data?.used.toFixed(2)}`}
    />
  );
};
