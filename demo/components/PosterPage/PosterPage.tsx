import {
  HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { BucketProviderProps, ImageProvider } from "@cache";
import { AssetPage, fetchAssets, Topic } from "@demo/utils/assets.endpoint";
import { cn } from "@demo/utils";
import { Poster } from "../Poster/Poster";

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
      {pageData &&
        pageData.assets.map((asset, index) => (
          <ImageProvider
            key={index}
            url={asset.url}
            type={asset.colorType}
            headers={{
              "Content-Type": asset.mimeType,
            }}
            width={120}
            height={160}
          >
            <Poster index={index} asset={asset} pageNumber={pageNumber} />
          </ImageProvider>
        ))}
    </div>
  );
};
