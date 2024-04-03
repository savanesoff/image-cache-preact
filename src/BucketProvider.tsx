import { createContext, useMemo } from "react";
import { Master } from "./master";
import { Bucket, BucketProps } from "./Bucket";

type BucketContextType = {
  [key in keyof Bucket]: Bucket[key];
};

const master = new Master();

export const BucketContext = createContext<BucketContextType>(Bucket.prototype);

interface ImageBucketProps extends Omit<BucketProps, "master"> {
  children: JSX.Element;
}

export const ImageBucket = ({
  name,
  locked = false,
  blit = false,
  load = true,
  urls = [],
  children,
}: ImageBucketProps) => {
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
