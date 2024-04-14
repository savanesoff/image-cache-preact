import { HTMLAttributes, useCallback, useState } from "react";
import { useImage, UseImageEvent } from "@cache";
import { cn } from "@utils";

export type LoadStatusProps = HTMLAttributes<HTMLDivElement>;
export const PosterLoadStatus = ({ ...props }: LoadStatusProps) => {
  const [loadStatus, setLoadStatus] = useState<"loading" | "loaded">("loading");
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState<"Yes" | "No">("No");
  const onError = useCallback((event: UseImageEvent<"error">) => {
    setError(event.statusText);
  }, []);

  const onProgress = useCallback((event: UseImageEvent<"progress">) => {
    setLoadStatus(event.progress < 1 ? "loading" : "loaded");
  }, []);

  const onRendered = useCallback(() => {
    setRendered("Yes");
  }, []);

  useImage({ onProgress, onError, onRendered });
  return (
    <div {...props}>
      {error ? <div className={cn("text-red-500")}>Error: {error}</div> : null}
      <div>Status: {loadStatus}</div>
      <div>Rendered: {rendered}</div>
    </div>
  );
};
