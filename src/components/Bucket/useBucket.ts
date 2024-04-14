/**
 * The `useBucket` hook provides a way to subscribe to events from a `Bucket` instance.
 * It is meant to be used within a component that is a child of `BucketProvider`.
 *
 * The `useBucket` hook takes an optional object of event handlers as its argument.
 * Each event handler is a function that will be called when the corresponding event is emitted.
 *
 * The events that can be handled are "progress", "loadend", "error", and "rendered".
 * The "progress", "loadend", and "error" events are emitted by the `Bucket` instance,
 * while the "rendered" event is emitted when an image has been rendered.
 */
import { Context } from "./Bucket";
import { useContext, useEffect } from "react";
import { BucketEvent } from "@/bucket";

export type UseBucketProps = {
  /** The progress event handler. */
  onProgress?: (event: BucketEvent<"progress">) => void;
  /** The error event handler. */
  onError?: (event: BucketEvent<"error">) => void;
  /** The loadend event handler. */
  onLoadend?: (event: BucketEvent<"loadend">) => void;
  /** The rendered event handler. */
  onRendered?: (event: BucketEvent<"rendered">) => void;
};

/**
 * The useBucket hook provides a way to listen to events emitted by the bucket.
 */
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
