import { cn } from "@/utils";
import { PostersView } from "./PostersView";

export const View = () => {
  return (
    <div className={cn("p-4", "bg-slate-600", "w-full")}>
      <div className={cn("bg-slate-800", "text-slate-300", "p-4", "text-2xl")}>
        View
      </div>
      <PostersView />
    </div>
  );
};
