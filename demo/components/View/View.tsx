import { cn } from "@demo/utils";
import { PostersRail } from "@demo/components";
import { CacheStats } from "./CacheStats";

/**
 * Example of an app view that uses the PostersRail component.
 * Like VOD.
 */
export const View = () => {
  return (
    <div className={cn("p-4", "bg-slate-600", "w-full")}>
      <CacheStats />
      <PostersRail />
    </div>
  );
};
