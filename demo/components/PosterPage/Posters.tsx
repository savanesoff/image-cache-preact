import { HTMLAttributes } from "react";
import { ImageProvider } from "@cache";
import { Poster } from "@demo/components";
import { cn } from "@demo/utils";

export type PosterProps = HTMLAttributes<HTMLDivElement> & {
  urls: string[];
  width: number;
  height: number;
};

export const Posters = ({
  urls,
  width,
  height,
  className,
  ...props
}: PosterProps) => {
  return (
    <div className={cn("flex flex-row space-x-2 ", className)} {...props}>
      {urls.map((url, index) => (
        <ImageProvider key={index} url={url} width={width} height={height}>
          <Poster index={index} />
        </ImageProvider>
      ))}
    </div>
  );
};
