import { cn } from "@demo/utils";
import { PostersRail } from "@demo/components";
import { CacheStats } from "./CacheStats";
import { useCallback, useState } from "react";

/**
 * Example of an app view that uses the PostersRail component.
 * Like VOD.
 */
export const View = () => {
  return (
    <div className={cn("p-4", "bg-slate-600", "w-full")}>
      <CacheStats />
      <PostersRail />
      {/* <PostersRail /> */}
      <ToggleRail />
    </div>
  );
};

const ToggleRail = () => {
  const [hidden, setHidden] = useState(true);
  const toggleRail = useCallback(() => setHidden((hidden) => !hidden), []);
  return (
    <div className="mt-2 flex flex-col items-start gap-2">
      <button className="rounded-md bg-blue-400 p-1 " onClick={toggleRail}>
        Toggle Rail
      </button>
      {!hidden && <PostersRail />}
    </div>
  );
};
