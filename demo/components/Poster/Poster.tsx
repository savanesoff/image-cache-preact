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

const initialFocus = {
  state: false,
};

/**
 * Poster component to display the image.
 * Uses the useImage hook to load the image.
 */
export const Poster = ({ className, index, asset, ...props }: PosterProps) => {
  const { request } = useImage();
  const { ref, focused, focusSelf } = useFocusable();

  useEffect(() => {
    if (focused) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [focused, ref, request]);

  useEffect(() => {
    if (initialFocus.state === false) {
      initialFocus.state = true;
      focusSelf();
    }
  }, [focusSelf]);

  return (
    <div
      ref={ref}
      className={cn(
        "bg-slate-800",
        `max-w-[${request.size.width}px]`,
        `w-[${request.size.width}px]`,
        `min-w-[${request.size.width}px]`,
        "flex flex-col space-y-1",
        className,
      )}
      {...props}
    >
      <div className={"flex flex-row justify-around space-x-1"}>
        <PosterLoadStatus />
        <PosterRenderStatus />
      </div>
      <PosterImage focused={focused} asset={asset} index={index} />
    </div>
  );
};
