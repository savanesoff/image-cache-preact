/**
 * The `useImage` hook provides a way to subscribe to events from an `Img` instance and its associated `RenderRequest`.
 * It is meant to be used within a component that is a child of `ImageProvider`.
 *
 * The `useImage` hook takes an optional object of event handlers as its argument.
 * Each event handler is a function that will be called when the corresponding event is emitted.
 *
 * The events that can be handled are "progress", "loadend", "error", and "rendered".
 * The "progress", "loadend", and "error" events are emitted by the `Img` instance,
 * while the "rendered" event is emitted by the `RenderRequest`.
 *
 */
import { useContext, useEffect } from "react";
import { ImageContext, ImageContextType } from "@components";
import { ImgEvent, RenderRequestEvent } from "@lib";

export type UseImageEventTypes = "progress" | "loadend" | "error" | "rendered";
/**
 * The useImage hook provides a way to listen to events emitted by the image loader.
 */
export type UseImageEvent<T extends UseImageEventTypes> =
  T extends Exclude<T, "rendered">
    ? ImgEvent<T>
    : T extends "rendered"
      ? RenderRequestEvent<T>
      : never;

/**
 * The useImage hook provides a way to listen to events emitted by the image loader.
 */
export type useImageProps = {
  onProgress?: (event: UseImageEvent<"progress">) => void;
  onError?: (event: UseImageEvent<"error">) => void;
  onLoadend?: (event: UseImageEvent<"loadend">) => void;
  onRendered?: (event: UseImageEvent<"rendered">) => void;
};

/**
 * The useImage hook provides a way to listen to events emitted by the image loader.
 */
export const useImage = ({
  onProgress,
  onError,
  onLoadend,
  onRendered,
}: useImageProps = {}): ImageContextType => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImage must be used within a ImageProvider");
  }
  const request = context.request;
  const image = context.request.image;

  useEffect(() => {
    onProgress && image.on("progress", onProgress);
    onError && image.on("error", onError);
    onLoadend && image.on("loadend", onLoadend);
    onRendered && request.on("rendered", onRendered);

    // this ensures that the loadend event is fired if the image is already loaded
    if (request.image.loaded) {
      onLoadend?.({
        type: "loadend",
        target: request.image,
        bytes: request.image.bytes,
      });
      onProgress?.({
        type: "progress",
        target: request.image,
        progress: 1,
      });
    }

    if (request.rendered) {
      onRendered?.({
        type: "rendered",
        target: request,
      });
    }

    return () => {
      onProgress && image.off("progress", onProgress);
      onError && image.off("error", onError);
      onLoadend && image.off("loadend", onLoadend);
      onRendered && request.off("rendered", onRendered);
    };
  }, [image, onProgress, onError, onLoadend, onRendered, request]);

  return context;
};
