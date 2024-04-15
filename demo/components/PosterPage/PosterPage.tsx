import { HTMLAttributes } from "react";
import { PageLoadStatus } from "./Status";
import { PageProgress } from "./Progress";
import { Posters } from "./Posters";
import { cn } from "@utils";
import { BucketProvider, BucketProviderProps } from "@cache";

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
  lock,
  name,
  className,
  ...props
}: PosterPageProps) => {
  return (
    <BucketProvider name={name} lock={lock}>
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        <div className="flex flex-row gap-6 bg-slate-800 p-2 text-sm text-slate-400">
          <div>Posters Page</div>
          <PageLoadStatus />
          <PageProgress />
        </div>
        <Posters urls={urls} width={100} height={160} />
      </div>
    </BucketProvider>
  );
};
