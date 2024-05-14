import { HTMLAttributes } from "react";
import { ImageProvider } from "@cache";
import { Poster } from "@demo/components";
import { cn } from "@demo/utils";
import { Asset } from "@demo/utils/assets.endpoint";

export type PosterProps = HTMLAttributes<HTMLDivElement> & {
  assets: Asset[];
  width: number;
  height: number;
};

export const Posters = ({
  assets,
  width,
  height,
  className,
  ...props
}: PosterProps) => {
  return (
    <div
      className={cn("flex flex-row space-x-2 overflow-hidden", className)}
      {...props}
    >
      {assets.map((asset, index) => (
        <ImageProvider
          key={index}
          url={asset.url}
          width={width}
          height={height}
        >
          <Poster index={index} asset={asset} />
        </ImageProvider>
      ))}
    </div>
  );
};
