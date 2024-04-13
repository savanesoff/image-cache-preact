import { useContext, useEffect } from "react";
import { Context } from "./Image";
import { ImgEvent } from "@/image";
import { RenderRequestEvent } from "@/request";

export type UseImageEventTypes = "progress" | "loadend" | "error" | "rendered";
export type UseImageEvent<T extends UseImageEventTypes> =
  T extends Exclude<T, "rendered">
    ? ImgEvent<T>
    : T extends "rendered"
      ? RenderRequestEvent<T>
      : never;

export type useImageProps = {
  onProgress?: (event: UseImageEvent<"progress">) => void;
  onError?: (event: UseImageEvent<"error">) => void;
  onLoadend?: (event: UseImageEvent<"loadend">) => void;
  onRendered?: (event: UseImageEvent<"rendered">) => void;
};

export const useImage = ({
  onProgress,
  onError,
  onLoadend,
  onRendered,
}: useImageProps = {}) => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useImage must be used within a ImageProvider");
  }
  const request = context.request;
  const image = context.request.image;
  useEffect(() => {
    if (onProgress) image.on("progress", onProgress);
    if (onError) image.on("error", onError);
    if (onLoadend) image.on("loadend", onLoadend);
    if (onRendered) request.on("rendered", onRendered);

    return () => {
      if (onProgress) image.off("progress", onProgress);
      if (onError) image.off("error", onError);
      if (onLoadend) image.off("loadend", onLoadend);
      if (onRendered) request.off("rendered", onRendered);
    };
  }, [image, onProgress, onError, onLoadend, onRendered, request]);

  return context;
};
