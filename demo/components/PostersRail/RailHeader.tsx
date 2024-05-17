import { cn } from "@demo/utils";
import {
  PageLoadStatus,
  RamUsage,
  PageRenderStatus,
  VideoUsage,
} from "@demo/components";
import { HTMLAttributes } from "react";
import { AssetCount } from "./AssetCount";
import { Topic } from "@demo/utils";

type RailHeaderProps = HTMLAttributes<HTMLDivElement> & {
  topic: Topic;
  focused?: boolean;
};
export const RailHeader = ({
  topic,
  className,
  focused,
  ...props
}: RailHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center space-x-2",
        " bg-slate-800 p-2 text-sm text-slate-400",
        focused && "bg-fuchsia-950",
        className,
      )}
      {...props}
    >
      <div>Rail: {topic.title} </div>
      <AssetCount />
      <PageLoadStatus />
      <PageRenderStatus />
      <RamUsage />
      <VideoUsage />
    </div>
  );
};
