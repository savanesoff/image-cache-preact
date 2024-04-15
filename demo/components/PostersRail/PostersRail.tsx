import { useMemo } from "react";
import config from "../../config.json";
import { PosterPage } from "@components/PosterPage";

/**
 * An example of poster rail that fetches data and renders cached posters
 */
export const PostersRail = () => {
  const urlsMain = useMemo(
    () =>
      new Array(10).fill(0).map(() => `${config.image}?hash=${Math.random()}`),
    [],
  );
  return (
    <div>
      <div>Scroll poster rail</div>
      <PosterPage name="Poser page main" lock urls={urlsMain} />
    </div>
  );
};
