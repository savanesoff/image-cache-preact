import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Bucket } from "./Bucket";
import { useBucket } from "./useBucket";

export type BucketContextType = {
  [key in keyof typeof Bucket]: (typeof Bucket)[key];
  //   [key in keyof typeof Bucket.prototype]: (typeof Bucket.prototype)[key];
  //keys<T>(o: T): (keyof T)[];
};

type BB = Omit<BucketContextType, "prototype">;

export const BucketContext = createContext<Bucket>(Bucket.prototype);

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
