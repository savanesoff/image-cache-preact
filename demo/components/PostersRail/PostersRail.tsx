import { PosterPage } from "@demo/components";
import { cn } from "@demo/utils";
import { Topic } from "@demo/utils/assets.endpoint";
import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";

type PosterRailProps = {
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
}: PosterRailProps) => {
  const { ref, focusKey, hasFocusedChild } = useFocusable({
    isFocusBoundary: true,
    focusBoundaryDirections: ["left", "right"],
    trackChildren: true,
  });

  return (
    <FocusContext.Provider value={focusKey}>
      <div
        ref={ref}
        data-testid="rail"
        className={cn(
          "no-scrollbar flex h-[245px] flex-row overflow-y-hidden overflow-x-scroll bg-slate-900",
          hasFocusedChild && "bg-orange-800",
        )}
        title={topic.description}
      >
        {/* <div>{topic.title}</div> */}
        {/* Lock the first page */}
        <PosterPage name="Poser page main" topic={topic} pageNumber={0} />
        {/* <PosterPage name="Poser page main" urls={urls} /> */}
        {/* <PosterPage name="Poser page main" urls={urlsMain} /> */}
      </div>
    </FocusContext.Provider>
  );
};
