import { createContext, useMemo } from "react";
import { Bucket, BucketProps } from "./Bucket";
import { Master } from "./master";

type BucketContextType = {
  [key in keyof Bucket]: Bucket[key];
};

const master = new Master();

export const BucketContext = createContext<BucketContextType>(Bucket.prototype);

interface BucketProviderProps extends Omit<BucketProps, "master"> {
  children: JSX.Element;
}

export const BucketProvider = ({
  name,
  locked = false,
  blit = false,
  load = true,
  urls = [],
  children,
}: BucketProviderProps) => {
  const bucket = useMemo(
    () =>
      new Bucket({
        name,
        master,
        locked,
        blit,
        load,
        urls,
      }),
    [name, locked, blit, load, urls]
  );

  return (
    <BucketContext.Provider value={bucket}>{children}</BucketContext.Provider>
  );
};
