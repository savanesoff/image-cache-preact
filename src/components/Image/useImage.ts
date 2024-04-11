import { useContext, useEffect } from "react";
import { Context } from "./Image";
import { Event } from "@/image";

export type ImageHook = {
  onProgress?: (event: Event<"progress">) => void;
  onError?: (event: Event<"error">) => void;
  onLoadend?: (event: Event<"loadend">) => void;
  // onRender?: (event: Event<"render">) => void;
};

export const useImage = ({
  onProgress,
  onError,
  onLoadend,
}: // onRender,
ImageHook) => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useImage must be used within a ImageProvider");
  }

  useEffect(() => {
    if (onProgress) context.request.image.on("progress", onProgress);
    if (onError) context.request.image.on("error", onError);
    if (onLoadend) context.request.image.on("loadend", onLoadend);
    // if (onRender) context.request.on("rendered", onRender);

    return () => {
      if (onProgress) context.request.image.off("progress", onProgress);
      if (onError) context.request.image.off("error", onError);
      if (onLoadend) context.request.image.off("loadend", onLoadend);
      // if (onRender) context.request.image.off("render", onRender);
    };
  }, [context.request.image, onProgress, onError, onLoadend, context.request]);

  return context;
};
