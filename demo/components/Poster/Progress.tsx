import { HTMLAttributes, useCallback, useState } from "react";
import { useImage, UseImageEvent } from "@cache";

export type ProgressProps = HTMLAttributes<HTMLDivElement>;
export const PosterProgress = ({ ...props }: ProgressProps) => {
  const [progress, setProgress] = useState(0);
  const onProgress = useCallback((event: UseImageEvent<"progress">) => {
    setProgress(event.progress);
  }, []);
  useImage({ onProgress });
  return <div {...props}>Progress: {progress}</div>;
};
