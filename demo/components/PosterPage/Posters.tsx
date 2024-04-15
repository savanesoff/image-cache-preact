import { HTMLAttributes, useCallback, useState } from "react";
import { ImageProvider, useBucket } from "@cache";
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
  const [show, setShow] = useState(false);
  const onRendered = useCallback(() => {
    setShow(true);
  }, []);
  useBucket({ onRendered });

  return (
    <div className={cn("flex gap-2", className)} {...props}>
      {urls.map((url, index) => (
        <ImageProvider key={index} url={url} width={width} height={height}>
          <Poster show={show} />
        </ImageProvider>
      ))}
    </div>
  );
};
