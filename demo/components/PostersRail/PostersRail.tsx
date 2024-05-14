import { HTMLAttributes } from "react";
import config from "../../config.json";
import { PosterPage } from "@demo/components";

const urls = new Array(10)
  .fill(0)
  .map(() => `${config.image}?hash=${Math.random()}`);
/**
 * An example of poster rail that fetches data and renders cached posters
 */
export const PostersRail = () => {
  return (
    <div>
      <Rail>
        {/* Lock the first page */}
        <PosterPage name="Poser page main" lock urls={urls} />
        {/* <PosterPage name="Poser page main" urls={urlsMain} /> */}
      </Rail>
    </div>
  );
};

type RailProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};
const Rail = ({ children }: RailProps) => {
  return (
    <div className="no-scrollbar flex w-auto overflow-x-scroll bg-slate-900">
      {children}
    </div>
  );
};
