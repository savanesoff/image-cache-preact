import { useMemo } from "react";
import config from "./config.json";
import { PostersBucket } from "./PostersBucket";

export const PostersView = () => {
  const urlsMain = useMemo(
    () =>
      new Array(10).fill(0).map(() => `${config.image}?hash=${Math.random()}`),
    [],
  );
  return <PostersBucket name="Poser page main" lock urls={urlsMain} />;
};
