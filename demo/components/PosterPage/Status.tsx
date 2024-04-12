import { Event as BucketEvent } from "@/bucket";
import { useCallback, useState } from "react";
import { useBucket } from "@/components/Bucket";

export const LoadStatus = () => {
  const [loadStatus, setLoadStatus] = useState<"loading" | "loaded">("loading");
  const [error, setError] = useState<Error | null>(null);
  const [rendered, setRendered] = useState<"Yes" | "No">("No");
  const onError = useCallback((event: BucketEvent<"error">) => {
    setError(event.error);
  }, []);

  const onProgress = useCallback((event: BucketEvent<"progress">) => {
    setLoadStatus(event.progress < 1 ? "loading" : "loaded");
  }, []);

  const onRendered = useCallback(() => {
    setRendered("Yes");
  }, []);

  useBucket({ onProgress, onError, onRendered });
  return (
    <>
      {error ? <div>Error: {error.message}</div> : null}
      <div>Status: {loadStatus}</div>
      <div>Rendered: {rendered}</div>
    </>
  );
};
