import { cn } from "@/utils";
import { PostersView } from "./PostersView";

export const View = () => {
  return (
    <div className={cn("p-4", "bg-slate-600", "w-full")}>
      <PostersView />
    </div>
  );
};
