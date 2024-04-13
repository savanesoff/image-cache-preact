import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { useBucket } from "@/components/Bucket";
import { RenderRequest } from "@/request";
import { Img, ImgProps, Size } from "@/index";

export type ImageContext = {
  image: Img | null;
  request: RenderRequest;
};

export const Context = createContext<ImageContext | null>(null);

export type ProviderProps = ImgProps &
  Size & {
    children: ReactNode;
  };

export const ImageProvider = ({
  url,
  headers,
  retry,
  children,
  height,
  width,
}: ProviderProps) => {
  const { bucket } = useBucket();
  const [image, setImage] = useState<Img | null>(null);
  // create render request
  const request = useMemo(
    () =>
      new RenderRequest({
        size: { height, width },
        url,
        bucket,
        headers,
        retry,
      }),
    [height, width, url, bucket, headers, retry],
  );

  useEffect(() => {
    request.on("rendered", (event) => {
      setImage(event.target.image);
    });
    return () => request.clear();
  }, [request]);

  return (
    <Context.Provider value={{ image, request }}>{children}</Context.Provider>
  );
};
