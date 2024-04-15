import { HTMLAttributes } from "react";
import { useImage } from "@cache";
import { cn } from "@utils";
import { PosterLoadStatus } from "./Status";
import { PosterProgress } from "./Progress";

export type PosterProps = HTMLAttributes<HTMLDivElement> & {
  show: boolean;
};

/**
 * Poster component to display the image.
 * Uses the useImage hook to load the image.
 */
export const Poster = ({ show, className, ...props }: PosterProps) => {
  const { image, request } = useImage();

  return (
    <div
      className={cn(
        "bg-orange-800",
        `max-w-[${request?.size.width}px]`,
        `w-[${request?.size.width}px]`,
        className,
      )}
      {...props}
    >
      <div className={cn("bg-slate-800 p-1 text-[8px]", className)}>
        <PosterLoadStatus />
        <PosterProgress />
      </div>
      <div
        className="transition-opacity duration-1000 ease-in-out"
        style={{
          width: request?.size.width,
          height: request?.size.height,
          position: "relative",
          backgroundImage: `url(${image?.url})`,
          backgroundSize: "cover",
          opacity: show ? 1 : 0,
        }}
      />
    </div>
  );
};
