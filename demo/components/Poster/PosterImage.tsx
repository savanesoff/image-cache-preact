import { useImage, useBucket } from "@/components";
import { RenderRequestEvent } from "@/lib";
import { cn } from "@demo/utils";
import { useState, useCallback } from "react";

/**
 * Renders the poster image using the useImage hook.
 */
export const PosterImage = ({ focused = false }) => {
  const [url, setUrl] = useState<string | null>(null);
  const onImageRendered = useCallback(
    (event: RenderRequestEvent<"rendered">) => {
      setUrl(event.target.image.url);
    },
    [],
  );
  const { request } = useImage({ onRendered: onImageRendered });

  const [show, setShow] = useState(false);
  const onBucketReady = useCallback(() => {
    setShow(true);
  }, []);
  useBucket({ onRendered: onBucketReady });

  return (
    <div
      className={cn("bg-cyan-900", url && "relative bg-orange-500 ")}
      style={{
        width: request.size.width,
        height: request.size.height,
        // for cobalt
        minWidth: request.size.width,
        minHeight: request.size.height,
        maxWidth: request.size.width,
        maxHeight: request.size.height,
        position: "relative",
      }}
    >
      <div
        className={cn(
          "opacity-0 transition-opacity duration-1000 ease-in-out",
          "h-full w-full",
          show && "opacity-100",
        )}
        style={{
          backgroundImage: `url(${url})`,
          backgroundSize: `${request?.size.width}px ${request?.size.height}px`,
        }}
      />

      <div
        className={cn(
          "absolute bottom-0 left-0 top-auto h-0 w-full bg-green-700",
          "duration-400 transition-all ease-in-out",
          "flex items-center justify-center text-xl text-slate-50",
          "opacity-0",
          focused && "h-1/2 opacity-90",
        )}
        style={{
          position: "absolute",
        }}
      >
        Details
      </div>
    </div>
  );
};
