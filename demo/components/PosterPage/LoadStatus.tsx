import { BucketEvent, useBucket } from "@cache";
import { useCallback, useState } from "react";
import { StatusBadge } from "../StatusBadge";

export const PageLoadStatus = () => {
  const [loaded, setLoaded] = useState(false);
  const onLoadend = useCallback(() => {
    setLoaded(true);
  }, []);

  const [progress, setProgress] = useState(0);
  const onProgress = useCallback((event: BucketEvent<"progress">) => {
    setProgress(Math.round(event.progress * 100));
  }, []);
  useBucket({ onLoadend, onProgress });
  return (
    <StatusBadge
      status={loaded ? "on" : "off"}
      text={loaded ? "loaded" : `loading: ${progress}%`}
    />
  );
};
