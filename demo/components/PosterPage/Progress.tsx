import { Event as BucketEvent } from "@/bucket";
import { useCallback, useState } from "react";
import { useBucket } from "@/components/Bucket";

export const Progress = () => {
  const [progress, setProgress] = useState(0);
  const onProgress = useCallback((event: BucketEvent<"progress">) => {
    setProgress(event.progress);
  }, []);
  useBucket({ onProgress });
  return <div>Progress: {progress}</div>;
};
