import { HTMLAttributes } from "react";
import { useImage } from "@cache";
import { cn } from "@demo/utils";
import { PosterLoadStatus } from "./LoadStatus";
import { PosterRenderStatus } from "./RenderStatus";
import { PosterImage } from "./PosterImage";

export type PosterProps = HTMLAttributes<HTMLDivElement>;

/**
 * Poster component to display the image.
 * Uses the useImage hook to load the image.
 */
export const Poster = ({ className, ...props }: PosterProps) => {
  const { request } = useImage();

  return (
    <div
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
      <PosterImage />
    </div>
  );
};
