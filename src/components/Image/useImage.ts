import { useContext, useEffect } from "react";
import { Context } from "./Image";
import { Event as ImageEvent } from "@/image";
import { Event as RequestEvent } from "@/image/render-request";

export type Events = "progress" | "loadend" | "error" | "rendered";
export type Event<T extends Events> = T extends Exclude<T, "rendered">
  ? ImageEvent<T>
  : T extends "rendered"
  ? RequestEvent<T>
  : never;

export type ImageHook = {
  onProgress?: (event: Event<"progress">) => void;
  onError?: (event: Event<"error">) => void;
  onLoadend?: (event: Event<"loadend">) => void;
  onRender?: (event: Event<"rendered">) => void;
};

export const useImage = ({
  onProgress,
  onError,
  onLoadend,
  onRender,
}: ImageHook = {}) => {
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
    if (onRender) request.on("rendered", onRender);

    return () => {
      if (onProgress) image.off("progress", onProgress);
      if (onError) image.off("error", onError);
      if (onLoadend) image.off("loadend", onLoadend);
      if (onRender) request.off("rendered", onRender);
    };
  }, [image, onProgress, onError, onLoadend, onRender, request]);

  return context;
};
