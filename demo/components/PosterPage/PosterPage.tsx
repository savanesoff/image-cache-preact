import { HTMLAttributes, useEffect, useState } from "react";
import { PageLoadStatus } from "./LoadStatus";
import { Posters } from "./Posters";
import { cn } from "@demo/utils";
import { BucketProvider, BucketProviderProps } from "@cache";
import { PageRenderStatus } from "./RenderStatus";
import { RamUsage } from "./RamUsage";
import { VideoUsage } from "./VideoUsage";
import { StatusBadge } from "../StatusBadge";
import { AssetPage, fetchAssets, Topic } from "@demo/utils/assets.endpoint";

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
  lock = false,
  name,
  className,
  ...props
}: PosterPageProps) => {
  const [pageData, setPageData] = useState<AssetPage>();
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAssets({
        topic,
        page: pageNumber,
      });
      setPageData(data);
    };
    fetchData();
  }, [topic, pageNumber]);

  if (!pageData) {
    return <div>Loading...</div>;
  }
  return (
    <BucketProvider name={name} lock={lock}>
      <div className={cn("flex flex-col", className)} {...props}>
        <div className="flex w-full flex-row items-center  bg-slate-800 p-2 text-sm text-slate-400">
          <div>Page {pageData.page}</div>
          <StatusBadge text={`count: ${pageData.assets.length}`} />
          <PageLoadStatus />
          <PageRenderStatus />
          <RamUsage />
          <VideoUsage />
        </div>
        <Posters assets={pageData.assets} width={100} height={160} />
      </div>
    </BucketProvider>
  );
};
