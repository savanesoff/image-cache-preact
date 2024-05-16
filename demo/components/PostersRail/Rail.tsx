import { cn } from "@demo/utils";
import { Topic } from "@demo/utils/assets.endpoint";
import { HTMLAttributes, useMemo } from "react";
import { PosterPage } from "../PosterPage";

export type RailProps = HTMLAttributes<HTMLDivElement> & {
  focused: boolean;
  topic: Topic;
  fromPage: number;
};
export const Rail = ({
  focused,
  topic,
  fromPage,
  className,
  ...props
}: RailProps) => {
  const pages = useMemo(
    () => Array.from({ length: topic.pages }),
    [topic.pages],
  );
  return (
    <div
      data-testid="rail"
      className={cn(
        "no-scrollbar flex h-[186px] flex-row space-x-2 overflow-y-hidden overflow-x-scroll bg-slate-900",
        focused && "bg-fuchsia-950",
        className,
      )}
      title={topic.description}
      {...props}
    >
      {pages.map((_, index) => (
        <PosterPage
          key={index}
          name="Poser page main"
          topic={topic}
          pageNumber={index + fromPage}
        />
      ))}
    </div>
  );
};
