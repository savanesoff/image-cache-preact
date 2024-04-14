import { BucketEvent, useBucket } from "@cache";
import { useCallback, useState } from "react";

export const PageProgress = () => {
  const [progress, setProgress] = useState(0);
  const onProgress = useCallback((event: BucketEvent<"progress">) => {
    setProgress(event.progress);
  }, []);
  useBucket({ onProgress });
  return <div>Progress: {progress}</div>;
};
