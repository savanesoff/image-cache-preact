import { HTMLAttributes } from "react";
import { PageLoadStatus } from "./LoadStatus";
import { Posters } from "./Posters";
import { cn } from "@demo/utils";
import { BucketProvider, BucketProviderProps } from "@cache";
import { PageRenderStatus } from "./RenderStatus";
import { RamUsage } from "./RamUsage";
import { VideoUsage } from "./VideoUsage";
import { StatusBadge } from "../StatusBadge";

export type PosterPageProps = HTMLAttributes<HTMLDivElement> &
  Exclude<BucketProviderProps, "children"> & {
    urls: string[];
  };

/**
 * Component that renders a section of a poster rail (page)
 * with its load status and progress.
 */
export const PosterPage = ({
  urls,
  lock = false,
  name,
  className,
  ...props
}: PosterPageProps) => {
  return (
    <BucketProvider name={name} lock={lock}>
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        <div className="flex flex-row gap-2 bg-slate-800 p-2 text-sm text-slate-400">
          <div>Page</div>
          <StatusBadge text={`count: ${urls.length}`} />
          <PageLoadStatus />
          <PageRenderStatus />
          <RamUsage />
          <VideoUsage />
        </div>
        <Posters urls={urls} width={100} height={160} />
      </div>
    </BucketProvider>
  );
};
