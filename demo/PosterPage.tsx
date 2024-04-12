import { Event as BucketEvent } from "@/bucket";
import { HTMLAttributes, useCallback, useState } from "react";
import { ImageProvider } from "@/components/Image";
import { useBucket } from "@/components/Bucket";
import { Poster } from "./Poster";

export type PosterPageProps = HTMLAttributes<HTMLDivElement> & {
  urls: string[];
};

export const PosterPage = ({ urls, ...props }: PosterPageProps) => {
  const [rendered, setRendered] = useState(false);
  const onProgress = useCallback((event: BucketEvent<"progress">) => {
    console.log("Bucket event onProgress", event);
  }, []);

  const onError = useCallback((event: BucketEvent<"error">) => {
    console.log("Bucket event onError", event);
  }, []);

  const onLoadend = useCallback((event: BucketEvent<"loadend">) => {
    console.log("Bucket event onLoadend", event);
  }, []);

  const onRender = useCallback((event: BucketEvent<"render">) => {
    console.log("Bucket event onRender", event);
    setRendered(event.rendered);
  }, []);

  const { bucket } = useBucket({ onProgress, onError, onLoadend, onRender });

  return (
    <div {...props}>
      <div>Posters View</div>
      <div>loaded: {bucket.loaded}</div>
      <div>loading: {bucket.loading}</div>
      <div>rendered: {bucket.rendered}</div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          opacity: rendered ? 1 : 0,
        }}
      >
        {urls.map((url, index) => (
          <ImageProvider key={index} url={url} width={100} height={200}>
            <Poster />
          </ImageProvider>
        ))}
      </div>
    </div>
  );
};
