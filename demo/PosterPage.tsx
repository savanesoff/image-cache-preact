import { Event as BucketEvent } from "@/bucket";
import { HTMLAttributes, useCallback, useState } from "react";
import { ImageProvider } from "@/components/Image";
import { useBucket } from "@/components/Bucket";
import { Poster } from "./Poster";

export type PosterPageProps = HTMLAttributes<HTMLDivElement> & {
  urls: string[];
};

export const PosterPage = ({ urls, ...props }: PosterPageProps) => {
  const [show, setShow] = useState(false);
  const onRendered = useCallback(() => {
    setShow(true);
  }, []);

  useBucket({ onRendered });

  return (
    <div {...props}>
      <div>Posters View</div>
      <LoadStatus />
      <Progress />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          opacity: show ? 1 : 0,
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

const Progress = () => {
  const [progress, setProgress] = useState(0);
  const onProgress = useCallback((event: BucketEvent<"progress">) => {
    setProgress(event.progress);
  }, []);
  useBucket({ onProgress });
  return <div>Progress: {progress}</div>;
};

const LoadStatus = () => {
  const [loadStatus, setLoadStatus] = useState<"loading" | "loaded">("loading");
  const [error, setError] = useState<Error | null>(null);
  const [rendered, setRendered] = useState<"Yes" | "No">("No");
  const onError = useCallback((event: BucketEvent<"error">) => {
    setError(event.error);
  }, []);

  const onProgress = useCallback((event: BucketEvent<"progress">) => {
    setLoadStatus(event.progress < 1 ? "loading" : "loaded");
  }, []);

  const onRendered = useCallback(() => {
    setRendered("Yes");
  }, []);

  useBucket({ onProgress, onError, onRendered });
  return (
    <>
      {error ? <div>Error: {error.message}</div> : null}
      <div>Status: {loadStatus}</div>
      <div>Rendered: {rendered}</div>
    </>
  );
};
