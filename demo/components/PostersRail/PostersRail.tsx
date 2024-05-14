import { BucketProvider, useBucket } from "@/components";
import { PosterPage, StatusBadge } from "@demo/components";
import { cn } from "@demo/utils";
import { Topic } from "@demo/utils/assets.endpoint";
import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import { PageLoadStatus } from "../PosterPage/LoadStatus";
import { RamUsage } from "../PosterPage/RamUsage";
import { PageRenderStatus } from "../PosterPage/RenderStatus";
import { VideoUsage } from "../PosterPage/VideoUsage";
import { HTMLAttributes, useCallback, useState } from "react";
import { BucketEvent } from "@/lib";

type PosterRailProps = HTMLAttributes<HTMLDivElement> & {
  topic: Topic;
  fromPage?: number;
  assetCount?: number;
};
/**
 * An example of poster rail that fetches data and renders cached posters
 */
export const PostersRail = ({
  topic,
  fromPage = 0,
  assetCount = 10,
  className,
  ...props
}: PosterRailProps) => {
  const { ref, focusKey, hasFocusedChild } = useFocusable({
    isFocusBoundary: true,
    focusBoundaryDirections: ["left", "right"],
    trackChildren: true,
  });

  return (
    <BucketProvider name={topic.title}>
      <FocusContext.Provider value={focusKey}>
        <div className={cn("flex flex-col", className)} {...props}>
          <div className="flex w-full flex-row items-center space-x-2 bg-slate-800 p-2 text-sm text-slate-400">
            <div>Page </div>
            <AssetCount />
            <PageLoadStatus />
            <PageRenderStatus />
            <RamUsage />
            <VideoUsage />
          </div>
          <div
            ref={ref}
            data-testid="rail"
            className={cn(
              "no-scrollbar flex h-[210px] flex-row overflow-y-hidden overflow-x-scroll bg-slate-900",
              hasFocusedChild && "bg-fuchsia-950",
            )}
            title={topic.description}
          >
            {/* <div>{topic.title}</div> */}
            {/* Lock the first page */}
            <PosterPage name="Poser page main" topic={topic} pageNumber={0} />
            {/* <PosterPage name="Poser page main" urls={urls} /> */}
            {/* <PosterPage name="Poser page main" urls={urlsMain} /> */}
          </div>
        </div>
      </FocusContext.Provider>
    </BucketProvider>
  );
};

const AssetCount = () => {
  const [imageCount, setImageCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const onUpdate = useCallback((event: BucketEvent<"update">) => {
    setImageCount(event.images);
    setRequestCount(event.requests);
  }, []);
  useBucket({ onUpdate });
  return (
    <>
      <StatusBadge text={`I: ${imageCount}`} />
      <StatusBadge text={`R: ${requestCount}`} />
    </>
  );
};
