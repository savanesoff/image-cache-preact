import { createContext, useMemo } from "react";
import { Bucket } from "./Bucket";
import { Master } from "./master";

type BucketContextType = {
  [key in keyof Bucket]: Bucket[key];
};

const master = new Master();

export const BucketContext = createContext<BucketContextType>(Bucket.prototype);

export const BucketProvider = ({
  locked = false,
  blit = false,
  load = true,
  urls = [],
  children,
}: {
  children: JSX.Element;
  locked?: boolean;
  blit?: boolean;
  load?: boolean;
  urls?: string[];
}) => {
  const bucket = useMemo(
    () =>
      new Bucket(
        master,
        {
          locked,
          blit,
          load,
        },
        urls
      ),
    [locked, blit, load, urls]
  );

  return (
    <BucketContext.Provider value={bucket}>{children}</BucketContext.Provider>
  );
};
