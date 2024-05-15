import { useImage, useBucket } from "@/components";
import { RenderRequestEvent } from "@/lib";
import { cn } from "@demo/utils";
import { Asset } from "@demo/utils/assets.endpoint";
import { useState, useCallback } from "react";

type PosterImageProps = {
  focused?: boolean;
  asset: Asset;
  index?: number;
  pageNumber?: number;
};
/**
 * Renders the poster image using the useImage hook.
 */
export const PosterImage = ({
  focused = false,
  asset,
  index,
  pageNumber,
}: PosterImageProps) => {
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
          "absolute bottom-0 left-0  top-full w-full overflow-hidden bg-slate-900",
          "duration-400 transition-all ease-in-out",
          "flex flex-col items-start justify-start text-xl text-slate-50",
          "h-1/2 p-2 opacity-0",
          focused && "top-1/2 opacity-80",
        )}
        style={{
          position: "absolute",
        }}
      >
        <div className="text-sm">
          i:{index} p:{pageNumber}
        </div>
        <div className="text-xs">Title {asset.title}</div>
        {/* <div className="text-xs">{asset.description}</div> */}
      </div>
    </div>
  );
};
