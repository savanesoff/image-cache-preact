import { BucketProvider, useBucket } from "@/components/Bucket";
import { Event as BucketEvent } from "@/bucket";
import { useCallback, useMemo } from "react";
import config from "./config.json";
import { ImageProvider, useImage } from "@/components/Image";
import { Event as ImageEvent } from "@/components/Image/useImage";

export const PostersView = () => {
  return (
    <BucketProvider name="Poser View" lock>
      <View />
    </BucketProvider>
  );
};

const View = () => {
  const onProgress = useCallback((event: BucketEvent<"progress">) => {
    console.log("onProgress", event);
  }, []);

  const onError = useCallback((event: BucketEvent<"error">) => {
    console.log("onError", event);
  }, []);

  const onLoadend = useCallback((event: BucketEvent<"loadend">) => {
    console.log("onLoadend", event);
  }, []);

  const onRender = useCallback((event: BucketEvent<"render">) => {
    console.log("onRender", event);
  }, []);

  const { bucket } = useBucket({ onProgress, onError, onLoadend, onRender });

  const urls = useMemo(
    () =>
      new Array(10).fill(0).map(() => `${config.image}?hash=${Math.random()}`),
    []
  );
  return (
    <div>
      <div>Posters View</div>
      <div>loaded: {bucket.loaded}</div>
      <div>loading: {bucket.loading}</div>
      <div>rendered: {bucket.rendered}</div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          //   opacity: bucket.rendered ? 1 : 0.2,
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

const Poster = () => {
  const onProgress = useCallback((event: ImageEvent<"progress">) => {
    console.log("onProgress", event);
  }, []);

  const onError = useCallback((event: ImageEvent<"error">) => {
    console.log("onError", event);
  }, []);

  const onLoadend = useCallback((event: ImageEvent<"loadend">) => {
    console.log("onLoadend", event);
  }, []);

  const onRender = useCallback((event: ImageEvent<"rendered">) => {
    console.log("onRender", event);
  }, []);

  const { image, request } = useImage({
    onProgress,
    onError,
    onLoadend,
    onRender,
  });

  return (
    <div>
      <div>Poster</div>
      <div>loaded: {image?.loaded}</div>
      <div>loading: {image?.loading}</div>
      <div>rendered: {request?.rendered}</div>
      <div
        style={{
          width: request?.size.width,
          height: request?.size.height,
          position: "relative",
          backgroundImage: `url(${image?.url})`,
          backgroundSize: "cover",
          backgroundColor: "black",
        }}
      />
    </div>
  );
};
