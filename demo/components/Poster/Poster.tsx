import { HTMLAttributes, useEffect } from "react";
import { useImage } from "@cache";
import { cn } from "@demo/utils";
import { PosterLoadStatus } from "./LoadStatus";
import { PosterRenderStatus } from "./RenderStatus";
import { PosterImage } from "./PosterImage";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { Asset } from "@demo/utils/assets.endpoint";

export type PosterProps = HTMLAttributes<HTMLDivElement> & {
  index: number;
  asset: Asset;
};

/**
 * Poster component to display the image.
 * Uses the useImage hook to load the image.
 */
export const Poster = ({ className, index, asset, ...props }: PosterProps) => {
  const { request } = useImage();
  const { ref, focused, focusSelf } = useFocusable();
  useEffect(() => {
    if (index === 0) {
      focusSelf();
    }
  }, [focusSelf, index]);

  useEffect(() => {
    if (focused) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [focused, ref, request]);
  return (
    <div
      ref={ref}
      className={cn(
        "bg-slate-800",
        `max-w-[${request.size.width}px]`,
        `w-[${request.size.width}px]`,
        "flex flex-col space-y-1",
        className,
      )}
      {...props}
    >
      <PosterLoadStatus />
      <PosterRenderStatus />
      <PosterImage focused={focused} asset={asset} />
    </div>
  );
};
