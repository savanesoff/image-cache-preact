import { HTMLAttributes, useCallback, useState } from "react";
import { useImage } from "@/components/Image";
import { UseImageEvent } from "@/components/Image/";

export type LoadStatusProps = HTMLAttributes<HTMLDivElement>;
export const Progress = ({ ...props }: LoadStatusProps) => {
  const [progress, setProgress] = useState(0);
  const onProgress = useCallback((event: UseImageEvent<"progress">) => {
    setProgress(event.progress);
  }, []);
  useImage({ onProgress });
  return <div {...props}>Progress: {progress}</div>;
};
