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
import { BucketContext, BucketContextType } from "./Bucket";
import { useContext, useEffect } from "react";
import { BucketEvent } from "@lib";

export type UseBucketProps = {
  /** The progress event handler. */
  onProgress?: (event: BucketEvent<"progress">) => void;
  /** The error event handler. */
  onError?: (event: BucketEvent<"error">) => void;
  /** The loadend event handler. */
  onLoadend?: (event: BucketEvent<"loadend">) => void;
  /** The rendered event handler. */
  onRendered?: (event: BucketEvent<"rendered">) => void;
  /** The request-rendered event handler. */
  onRequestRendered?: (event: BucketEvent<"request-rendered">) => void;
  /** The render-progress event handler. */
  onRenderProgress?: (event: BucketEvent<"render-progress">) => void;
  /** The update event handler provides count data */
  onUpdate?: (event: BucketEvent<"update">) => void;
};

/**
 * The useBucket hook provides a way to listen to events emitted by the bucket.
 */
export const useBucket = ({
  onProgress,
  onError,
  onLoadend,
  onRendered,
  onRequestRendered,
  onRenderProgress,
  onUpdate,
}: UseBucketProps = {}): BucketContextType => {
  const context = useContext(BucketContext);
  if (!context) {
    throw new Error("useBucket must be used within a BucketProvider");
  }

  useEffect(() => {
    onProgress && context.bucket.on("progress", onProgress);
    onError && context.bucket.on("error", onError);
    onLoadend && context.bucket.on("loadend", onLoadend);
    onRendered && context.bucket.on("rendered", onRendered);
    onRequestRendered &&
      context.bucket.on("request-rendered", onRequestRendered);
    onRenderProgress && context.bucket.on("render-progress", onRenderProgress);
    onUpdate && context.bucket.on("update", onUpdate);
    if (context.bucket.loaded) {
      onLoadend?.({ type: "loadend", target: context.bucket, loaded: true });
    }
    if (context.bucket.rendered) {
      onRendered?.({
        type: "rendered",
        target: context.bucket,
        rendered: true,
      });
    }
    onUpdate?.({
      type: "update",
      target: context.bucket,
      requests: context.bucket.requests.size,
      images: context.bucket.getImages().size,
    });

    return () => {
      onProgress && context.bucket.off("progress", onProgress);
      onError && context.bucket.off("error", onError);
      onLoadend && context.bucket.off("loadend", onLoadend);
      onRendered && context.bucket.off("rendered", onRendered);
      onRequestRendered &&
        context.bucket.off("request-rendered", onRequestRendered);
      onRenderProgress &&
        context.bucket.off("render-progress", onRenderProgress);
      onUpdate && context.bucket.off("update", onUpdate);
    };
  }, [
    context.bucket,
    onProgress,
    onError,
    onLoadend,
    onRendered,
    onRequestRendered,
    onRenderProgress,
    onUpdate,
  ]);
  return context;
};
