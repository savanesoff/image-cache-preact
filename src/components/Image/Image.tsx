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
import { useBucket } from '@components/Bucket';
import { ImgProps } from '@lib/image';
import { Size } from '@utils';
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useVisibilityObserver } from '@utils';
import { RenderRequest } from '@lib/request';

export type ImageContextType = {
  request: RenderRequest;
  height: number;
  width: number;
  url: string | null;
  visibilityRef: (node: HTMLElement | null) => void; // The type for the ref callback;
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
    /**
     * Whether to track the visibility of the image
     */
    trackVisibility?: boolean;
  };

/**
 * Provides an image to its children.
 * @param children - The children to render.
 * @param height - The height of the image.
 * @param width - The width of the image.
 * @param url - The URL of the image.
 * @param gpuDataFull - The GPU handling mode for the image.
 * @param headers - The headers for the image.
 * @param retry - The number of times to retry loading the image.
 * @param type - The type of the image.
 * @param visibilityMargin - The margin for the visibility.
 * @param trackVisibility - Whether to track the visibility of the image. Default is true.
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
  trackVisibility = true,
}: ImageProviderProps) => {
  const [request, setRequest] = useState<RenderRequest | null>(null);
  const [cleared, setCleared] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const { visible, ref } = useVisibilityObserver({
    rootMargin: visibilityMargin,
    initialInView: true,
    trackVisibility,
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
    newRequest.on('clear', onCleared);
    newRequest.on('rendered', onRendered);
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
    <>
      {request && (
        <ImageContext.Provider
          value={{ request, url: renderUrl, height, width, visibilityRef: ref }}
        >
          {children}
        </ImageContext.Provider>
      )}
    </>
  );
};
