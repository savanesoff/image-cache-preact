import { Bucket, BucketProps } from "@/bucket";
import { createContext, ReactNode, useEffect, useMemo } from "react";
import { useController } from "../Controller";

export type BucketContext = {
  bucket: Bucket;
};
export const Context = createContext<BucketContext | null>(null);

export type ProviderProps = Pick<BucketProps, "name" | "lock"> & {
  children?: ReactNode;
};

export function BucketProvider({ children, ...props }: ProviderProps) {
  const { controller } = useController();
  const bucket = useMemo(
    () =>
      new Bucket({
        controller,
        ...props,
      }),
    [props, controller],
  );

  useEffect(() => {
    return () => bucket.clear();
  }, [bucket]);

  return <Context.Provider value={{ bucket }}>{children}</Context.Provider>;
}
