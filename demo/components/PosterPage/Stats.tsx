import { BucketEvent, useBucket } from "@cache";
import { useCallback, useState } from "react";

export const PageStats = () => {
  const [progress, setProgress] = useState(0);
  const onProgress = useCallback((event: BucketEvent<"progress">) => {
    setProgress(event.progress);
    // bucket.getBytesRam();
  }, []);
  const { bucket } = useBucket({ onProgress });
  return <div>Progress: {progress}</div>;
};
