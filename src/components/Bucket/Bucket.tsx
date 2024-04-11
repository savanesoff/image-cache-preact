import { Bucket, BucketProps } from "@/bucket";
import { createContext, ReactNode, useEffect, useMemo } from "react";
import { useController } from "../Controller";

export type BucketContext = {
  bucket: Bucket;
};
export const Context = createContext<BucketContext | null>(null);

export type ProviderProps = BucketProps & {
  children: ReactNode;
};

export function BucketProvider({
  name,
  load,
  lock,
  render,
  children,
}: ProviderProps) {
  const { controller } = useController();
  const bucket = useMemo(
    () =>
      new Bucket({
        name,
        load,
        lock,
        render,
        controller,
      }),
    [name, load, lock, render, controller]
  );

  useEffect(() => {
    return () => bucket.clear();
  }, [bucket]);

  return <Context.Provider value={{ bucket }}>{children}</Context.Provider>;
}
