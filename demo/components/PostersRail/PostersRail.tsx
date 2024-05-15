import { BucketProvider } from "@/components";
import { cn } from "@demo/utils";
import { Topic } from "@demo/utils/assets.endpoint";
import {
  FocusContext,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import { HTMLAttributes } from "react";
import { RailHeader } from "./RailHeader";
import { Rail } from "./Rail";

type PosterRailProps = HTMLAttributes<HTMLDivElement> & {
  topic: Topic;
  fromPage?: number;
};
/**
 * An example of poster rail that fetches data and renders cached posters
 */
export const PostersRail = ({
  topic,
  fromPage = 0,
  className,
  ...props
}: PosterRailProps) => {
  const { ref, focusKey, hasFocusedChild } = useFocusable({
    isFocusBoundary: true,
    focusBoundaryDirections: ["left", "right"],
    trackChildren: true,
  });

  return (
    <FocusContext.Provider value={focusKey}>
      <BucketProvider name={topic.title}>
        <div className={cn("flex flex-col", className)} {...props} ref={ref}>
          <RailHeader topic={topic} focused={hasFocusedChild} />
          <Rail topic={topic} fromPage={fromPage} focused={hasFocusedChild} />
        </div>
      </BucketProvider>
    </FocusContext.Provider>
  );
};
