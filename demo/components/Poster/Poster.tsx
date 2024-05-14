import { HTMLAttributes, useCallback, useState } from "react";
import { RenderRequestEvent, useBucket, useImage } from "@cache";
import { cn } from "@demo/utils";
import { PosterLoadStatus } from "./LoadStatus";
import { PosterRenderStatus } from "./RenderStatus";

export type PosterProps = HTMLAttributes<HTMLDivElement>;

/**
 * Poster component to display the image.
 * Uses the useImage hook to load the image.
 */
export const Poster = ({ className, ...props }: PosterProps) => {
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
      className={cn(
        "bg-slate-800",
        `max-w-[${request?.size.width}px]`,
        `w-[${request?.size.width}px]`,
        "flex flex-col space-y-1",
        className,
      )}
      {...props}
    >
      <PosterLoadStatus />
      <PosterRenderStatus />
      <div
        className="transition-opacity duration-1000 ease-in-out"
        style={{
          width: request?.size.width,
          height: request?.size.height,
          minWidth: request?.size.width,
          minHeight: request?.size.height,
          maxWidth: request?.size.width,
          maxHeight: request?.size.height,
          position: "relative",
          backgroundImage: `url(${url})`,
          backgroundSize: `${request?.size.width}px ${request?.size.height}px`,
          opacity: show ? 1 : 0,
        }}
      />
    </div>
  );
};
