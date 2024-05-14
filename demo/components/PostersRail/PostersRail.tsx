import { HTMLAttributes } from "react";
import config from "@demo/config.json";
import { PosterPage } from "@demo/components";

const urls = new Array(40)
  .fill(0)
  .map(() => `${config.image}?hash=${Math.random()}`);
/**
 * An example of poster rail that fetches data and renders cached posters
 */
export const PostersRail = () => {
  return (
    <Rail>
      {/* Lock the first page */}
      <PosterPage name="Poser page main" lock urls={urls} />
      {/* <PosterPage name="Poser page main" urls={urls} /> */}
      {/* <PosterPage name="Poser page main" urls={urlsMain} /> */}
    </Rail>
  );
};

type RailProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};
const Rail = ({ children }: RailProps) => {
  return (
    <div
      data-testid="rail"
      className="no-scrollbar flex h-[260px]  flex-row overflow-x-auto overflow-y-visible bg-slate-900"
    >
      {children}
    </div>
  );
};
