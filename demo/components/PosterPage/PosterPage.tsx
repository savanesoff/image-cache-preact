import { HTMLAttributes, useCallback, useState } from "react";
import { ImageProvider } from "@/components/Image";
import { useBucket } from "@/components/Bucket";
import { Poster } from "../../Poster";
import { LoadStatus } from "./Status";
import { Progress } from "./Progress";

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
