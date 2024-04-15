import { cn } from "@utils";
import { PostersRail } from "./components/PostersRail/PostersRail";

/**
 * Example of an app view that uses the PostersRail component.
 * Like VOD.
 */
export const View = () => {
  return (
    <div className={cn("p-4", "bg-slate-600", "w-full")}>
      <PostersRail />
    </div>
  );
};
