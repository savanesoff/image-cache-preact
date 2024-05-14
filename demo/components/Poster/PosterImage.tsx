import { useImage, useBucket } from "@/components";
import { RenderRequestEvent } from "@/lib";
import { cn } from "@demo/utils";
import { useState, useCallback } from "react";

export const PosterImage = () => {
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
      className={cn("bg-cyan-900", url && "bg-orange-500")}
      style={{
        width: request.size.width,
        height: request.size.height,
        minWidth: request.size.width,
        minHeight: request.size.height,
        maxWidth: request.size.width,
        maxHeight: request.size.height,
        // opacity: show ? 1 : 0,
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
    </div>
  );
};
