import { BucketEvent, useBucket } from "@cache";
import { useCallback, useState } from "react";
import { StatusBadge } from "../StatusBadge";

export const PageRenderStatus = () => {
  const [rendered, setRendered] = useState(false);
  const [progress, setProgress] = useState(0);
  const onRendered = useCallback(() => {
    setRendered(true);
  }, []);
  const onRequestRendered = useCallback(
    (event: BucketEvent<"request-rendered">) => {
      setProgress(Math.round(event.progress * 100));
    },
    [],
  );

  useBucket({ onRendered, onRequestRendered });
  return (
    <StatusBadge
      status={rendered ? "on" : "off"}
      text={rendered ? "rendered" : `rendering: ${progress}%`}
    />
  );
};
