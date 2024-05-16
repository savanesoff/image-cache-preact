import {
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BucketProviderProps, ImageProvider } from "@cache";
import {
  Asset,
  AssetPage,
  fetchAssets,
  Topic,
} from "@demo/utils/assets.endpoint";
import { cn } from "@demo/utils";
import { Poster } from "../Poster/Poster";
import config from "@demo/config.json";

export type PosterPageProps = HTMLAttributes<HTMLDivElement> &
  Exclude<BucketProviderProps, "children"> & {
    topic: Topic;
    pageNumber: number;
  };

/**
 * Component that renders a section of a poster rail (page)
 * with its load status and progress.
 */
export const PosterPage = ({
  topic,
  pageNumber,
  className,
  ...props
}: PosterPageProps) => {
  const [pageData, setPageData] = useState<AssetPage>();
  const [fetchStatus, setFetchStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const ref = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setFetchStatus("loading");
    const data = await fetchAssets({
      topic,
      page: pageNumber,
    });
    if (data) {
      setPageData(data);
      setFetchStatus("loaded");
    } else {
      setFetchStatus("error");
    }
  }, [topic, pageNumber]);

  /**
   * Fetch initial data when the page number is 0
   * The page number is 0 when the component is first rendered
   * All other pages are fetched when the page is scrolled into view
   */
  useEffect(() => {
    if (pageNumber === 0) {
      fetchData();
    }
  }, [fetchData, pageNumber]);

  useEffect(() => {
    const target = ref.current;
    if (!target || fetchStatus !== "idle" || pageNumber === 0) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchData();
        }
      },
      {
        // root: target.parentElement,
        rootMargin: "200px", // Adjust this value to change the margin
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [pageNumber, fetchStatus, fetchData, ref]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-w-full flex-shrink-0 flex-grow flex-row space-x-2 overflow-y-clip",
        className,
      )}
      {...props}
    >
      {!pageData && <div>{fetchStatus}</div>}
      {pageData?.assets.map((asset, index) => (
        <ImageContent
          key={asset.title}
          asset={asset}
          index={index}
          pageNumber={pageNumber}
        />
      ))}
    </div>
  );
};

/**
 * Since headers are created on the fly, we need to memoize them
 * @param param0
 * @returns
 */
const ImageContent = ({
  asset,
  index,
  pageNumber,
}: {
  asset: Asset;
  index: number;
  pageNumber: number;
}) => {
  const headers = useMemo(
    () => ({
      "Content-Type": asset.mimeType,
    }),
    [asset.mimeType],
  );

  return (
    <ImageProvider
      key={index}
      url={asset.url}
      type={asset.colorType}
      headers={headers}
      width={config.image.renderWidth}
      height={config.image.renderHeight}
    >
      <Poster index={index} asset={asset} pageNumber={pageNumber} />
    </ImageProvider>
  );
};
