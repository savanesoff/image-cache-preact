/**
 * The `ImageProvider` component is a React context provider for an image.
 * It provides an `ImageContext` that contains an `Img` instance and a `RenderRequest`.
 *
 * The `ImageProvider` component takes `ImgProps` and `Size` as props, as well as a `children` prop for the child components.
 *
 * The `ImageProvider` component uses the `useBucket` hook to get the current `Bucket` instance.
 * It maintains a state for the `Img` instance and creates a `RenderRequest` using the `useMemo` hook.
 *
 * Usage:
 *
 * <ImageProvider url="http://example.com/image.jpg" height={500} width={500}>
 *   <MyComponent />
 * </ImageProvider>
 *
 * In this example, `MyComponent` and its descendants can use the `useContext` hook to access the `ImageContext`,
 * which contains the `Img` instance and the `RenderRequest` for the image.
 */
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

/**
 * Provides an image to its children.
 * @param props - The properties for the provider.
 * @returns The image provider.
 */
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
