import { cn } from '@demo/utils';
import { Topic } from '@demo/utils/assets.endpoint';
import { HTMLAttributes, useMemo } from 'react';
import { PosterPage } from '@demo/components';

export type RailProps = HTMLAttributes<HTMLDivElement> & {
  focused: boolean;
  topic: Topic;
  fromPage: number;
};
// pages we want to fetch immediately
// every other page will be fetched when it comes into view
const immediateFetchPages = [0];

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
        'flex h-[186px] flex-row space-x-2 overflow-y-hidden overflow-x-scroll bg-slate-900 no-scrollbar',
        focused && 'bg-fuchsia-950',
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
          immediateFetch={immediateFetchPages.includes(index)}
        />
      ))}
    </div>
  );
};
