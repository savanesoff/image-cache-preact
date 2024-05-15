import { BucketEvent, useBucket } from "@cache";
import { useCallback, useState } from "react";
import { StatusBadge } from "../StatusBadge";

export const PageRenderStatus = () => {
  const [rendered, setRendered] = useState(false);
  const [progress, setProgress] = useState(0);
  const onRendered = useCallback(() => {
    setRendered(true);
  }, []);
  const onRenderProgress = useCallback(
    (event: BucketEvent<"render-progress">) => {
      setProgress(Math.round(event.progress * 100));
    },
    [],
  );

  useBucket({ onRenderProgress, onRendered });
  return (
    <StatusBadge
      status={rendered ? "on" : "off"}
      text={rendered ? "rendered" : `r: ${progress}%`}
    />
  );
};
