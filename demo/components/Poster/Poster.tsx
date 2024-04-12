import { useCallback } from "react";
import { useImage } from "@/components/Image";
import { Event as ImageEvent } from "@/components/Image/useImage";

export const Poster = () => {
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
