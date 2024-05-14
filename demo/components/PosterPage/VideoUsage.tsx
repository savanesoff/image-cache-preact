import { useBucket } from "@cache";
import { useCallback, useState } from "react";
import { StatusBadge } from "@demo/components";

export const VideoUsage = () => {
  const [requested, setRequested] = useState("0");
  const [used, setUsed] = useState("0");

  const { bucket } = useBucket();
  const onRequestRendered = useCallback(() => {
    const data = bucket.getVideoUnits();
    setRequested(data.requested.toFixed(3) + data.type);
    setUsed(data.used.toFixed(3) + data.type);
  }, [bucket]);
  useBucket({ onRequestRendered });
  return <StatusBadge status="warn" text={`Video r:${requested} u:${used}`} />;
};
