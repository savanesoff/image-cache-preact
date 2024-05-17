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
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useBucket } from "@components";
import { RenderRequest, ImgProps, Size } from "@lib";
import { useVisibilityObserver } from "@/utils/useVisibilityObserver";

export type ImageContextType = {
  request: RenderRequest;
  height: number;
  width: number;
  url: string | null;
};

export const ImageContext = createContext<ImageContextType>(
  {} as ImageContextType,
);

export type ImageProviderProps = ImgProps &
  Size & {
    children?: ReactNode;
    /**
     * How far off the screen to trigger rendering, default 0,
     * meaning at the edge of the viewport
     */
    visibilityMargin?: string;
  };

/**
 * Provides an image to its children.
 * @param props - The properties for the provider.
 * @returns The image provider.
 */
export const ImageProvider = ({
  children,
  height,
  width,
  url,
  gpuDataFull,
  headers,
  retry,
  type,
  visibilityMargin,
}: ImageProviderProps) => {
  const [request, setRequest] = useState<RenderRequest | null>(null);
  const [cleared, setCleared] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  // need to track visibility of the image to handle clearing
  const ref = useRef<HTMLDivElement>(null);
  const { visible } = useVisibilityObserver({
    ref,
    rootMargin: visibilityMargin,
  });

  const { bucket } = useBucket();

  const onCleared = useCallback(() => {
    setCleared(true);
    // revoke the url when cleared
    setRenderUrl(null);
  }, []);

  // provide url to children when rendered
  const onRendered = useCallback(() => {
    setRenderUrl(url);
  }, [url]);

  useEffect(() => {
    if (cleared && visible) {
      setCleared(false);
    }
  }, [cleared, visible]);

  /**
   * Lock the request when it is visible,
   * so that it can't be cleared while it is still visible.
   */
  useEffect(() => {
    if (!request) return;
    request.visible = visible;
  }, [request, visible]);

  useEffect(() => {
    if (cleared) return;
    const newRequest = new RenderRequest({
      size: { height, width },
      bucket,
      url,
      gpuDataFull,
      headers,
      type,
      retry,
    });
    setRequest(newRequest);
    newRequest.on("clear", onCleared);
    newRequest.on("rendered", onRendered);
    return () => {
      newRequest.clear(true);
    };
  }, [
    height,
    width,
    bucket,
    url,
    gpuDataFull,
    headers,
    retry,
    type,
    cleared,
    onCleared,
    onRendered,
  ]);

  return (
    <div data-cache-id={url} ref={ref}>
      {request && (
        <ImageContext.Provider
          value={{ request, url: renderUrl, height, width }}
        >
          {children}
        </ImageContext.Provider>
      )}
    </div>
  );
};
