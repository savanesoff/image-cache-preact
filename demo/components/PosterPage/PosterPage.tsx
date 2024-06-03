import {
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BucketProviderProps, ImageProvider } from '@cache';
import { Asset, AssetPage, fetchAssets, Topic } from '@demo/utils';
import { cn } from '@demo/utils';
import { Poster } from '@demo/components';
import { config } from '@demo/config';
import { useVisibilityObserver } from '@cache';

export type PosterPageProps = HTMLAttributes<HTMLDivElement> &
  Exclude<BucketProviderProps, 'children'> & {
    topic: Topic;
    pageNumber: number;
    /** Array of page numbers to fetch initially */
    immediateFetch?: boolean;
  };

/**
 * Component that renders a section of a poster rail (page)
 * with its load status and progress.
 */
export const PosterPage = ({
  topic,
  pageNumber,
  className,
  immediateFetch,
  ...props
}: PosterPageProps) => {
  const [pageData, setPageData] = useState<AssetPage>();
  const [fetchStatus, setFetchStatus] = useState<
    'idle' | 'loading' | 'loaded' | 'error'
  >('idle');

  /**
   * Fetches the assets for the page
   */
  const fetchData = useCallback(async () => {
    setFetchStatus('loading');
    const data = await fetchAssets({
      topic,
      page: pageNumber,
    });
    if (data) {
      setPageData(data);
      setFetchStatus('loaded');
    } else {
      setFetchStatus('error');
    }
  }, [topic, pageNumber]);

  const { visible, ref } = useVisibilityObserver({
    rootMargin: config.visibilityMargin,
  });

  useEffect(() => {
    if (visible && fetchStatus === 'idle') {
      fetchData();
    }
  }, [fetchStatus, fetchData, visible]);

  useEffect(() => {
    if (immediateFetch) {
      fetchData();
    }
  }, [fetchData, immediateFetch]);

  return (
    <div
      ref={ref}
      className={cn(
        'flex min-w-fit flex-shrink-0 flex-grow flex-row space-x-2 overflow-y-clip',
        className,
      )}
      {...props}
    >
      {!pageData && (
        <div className="flex h-full w-full items-center justify-center bg-slate-900">
          {fetchStatus}
        </div>
      )}
      {pageData?.assets.map((asset, index) => (
        <ImageContent
          key={asset.title}
          asset={asset}
          index={index}
          pageNumber={pageNumber}
          showImmediately={!immediateFetch}
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
  showImmediately,
}: {
  asset: Asset;
  index: number;
  pageNumber: number;
  showImmediately?: boolean;
}) => {
  const headers = useMemo(
    () => ({
      'Content-Type': asset.mimeType,
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
      visibilityMargin={config.visibilityMargin}
    >
      <Poster
        index={index}
        asset={asset}
        pageNumber={pageNumber}
        showImmediately={showImmediately}
      />
    </ImageProvider>
  );
};
