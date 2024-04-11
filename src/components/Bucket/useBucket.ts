import { Context } from "./Bucket";
import { useContext, useEffect } from "react";
import { Event } from "@/bucket";

export type BucketHook = {
  onProgress?: (event: Event<"progress">) => void;
  onError?: (event: Event<"error">) => void;
  onLoadend?: (event: Event<"loadend">) => void;
  onRender?: (event: Event<"render">) => void;
};

export const useBucket = ({
  onProgress,
  onError,
  onLoadend,
  onRender,
}: BucketHook = {}) => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useBucket must be used within a BucketProvider");
  }

  useEffect(() => {
    if (onProgress) context.bucket.on("progress", onProgress);
    if (onError) context.bucket.on("error", onError);
    if (onLoadend) context.bucket.on("loadend", onLoadend);
    if (onRender) context.bucket.on("render", onRender);

    return () => {
      if (onProgress) context.bucket.off("progress", onProgress);
      if (onError) context.bucket.off("error", onError);
      if (onLoadend) context.bucket.off("loadend", onLoadend);
      if (onRender) context.bucket.off("render", onRender);
    };
  }, [context.bucket, onProgress, onError, onLoadend, onRender]);
  return context;
};
