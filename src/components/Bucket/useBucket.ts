import { Context } from "./Bucket";
import { useContext, useEffect } from "react";
import { BucketEvent } from "@/bucket";

export type UseBucketProps = {
  onProgress?: (event: BucketEvent<"progress">) => void;
  onError?: (event: BucketEvent<"error">) => void;
  onLoadend?: (event: BucketEvent<"loadend">) => void;
  onRendered?: (event: BucketEvent<"rendered">) => void;
};

export const useBucket = ({
  onProgress,
  onError,
  onLoadend,
  onRendered,
}: UseBucketProps = {}) => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useBucket must be used within a BucketProvider");
  }

  useEffect(() => {
    if (onProgress) context.bucket.on("progress", onProgress);
    if (onError) context.bucket.on("error", onError);
    if (onLoadend) context.bucket.on("loadend", onLoadend);
    if (onRendered) context.bucket.on("rendered", onRendered);

    return () => {
      if (onProgress) context.bucket.off("progress", onProgress);
      if (onError) context.bucket.off("error", onError);
      if (onLoadend) context.bucket.off("loadend", onLoadend);
      if (onRendered) context.bucket.off("rendered", onRendered);
    };
  }, [context.bucket, onProgress, onError, onLoadend, onRendered]);
  return context;
};
