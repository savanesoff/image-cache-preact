import { useBucket } from "@cache";
import { useCallback, useState } from "react";
import { StatusBadge } from "@demo/components";

export const VideoUsage = () => {
  const [requested, setRequested] = useState("0");
  const [used, setUsed] = useState("0");

  const { bucket } = useBucket();
  const onRequestRendered = useCallback(() => {
    const data = bucket.getBytesVideo();
    setRequested(data.requestedUnits);
    setUsed(data.usedUnits);
  }, [bucket]);
  useBucket({ onRequestRendered });
  return <StatusBadge text={`Video r:${requested} u:${used}`} />;
};
