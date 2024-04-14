import { HTMLAttributes } from "react";
import { PageLoadStatus } from "./Status";
import { PageProgress } from "./Progress";
import { Posters } from "./Posters";
import { cn } from "@utils";

export type PosterPageProps = HTMLAttributes<HTMLDivElement> & {
  urls: string[];
};

export const PosterPage = ({ urls, className, ...props }: PosterPageProps) => {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="flex flex-row gap-6 bg-slate-800 p-2 text-sm text-slate-400">
        <div>Posters View</div>
        <PageLoadStatus />
        <PageProgress />
      </div>
      <Posters urls={urls} width={100} height={160} />
    </div>
  );
};
