import { BucketRamUnits, useBucket } from "@cache";
import { useCallback, useState } from "react";
import { StatusBadge } from "@demo/components";

export const RamUsage = () => {
  const [data, setData] = useState<BucketRamUnits>();

  const { bucket } = useBucket();
  const onRequestRendered = useCallback(() => {
    setData(bucket.getRamUnits());
  }, [bucket]);
  useBucket({ onRequestRendered });
  return (
    <StatusBadge
      text={`RAM (${data?.type}) c:${data?.compressed.toFixed(2)} u:${data?.uncompressed.toFixed(2)} t:${data?.total.toFixed(2)}`}
    />
  );
};
