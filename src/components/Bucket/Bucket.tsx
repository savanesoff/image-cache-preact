/**
 * The `BucketProvider` component is a React context provider for a `Bucket` instance.
 * It provides a `BucketContext` that contains a `Bucket` instance.
 *
 * The `BucketProvider` component takes `BucketProps` and a `children` prop for the child components.
 *
 * The `BucketProvider` component uses the `useController` hook to get the current `Controller` instance,
 * and the `useMemo` hook to create a `Bucket` instance with the provided props.
 *
 * The `BucketProvider` component also uses the `useEffect` hook to clear the `Bucket` when the component is unmounted.
 */
import { Bucket, BucketProps } from "@/bucket";
import { createContext, ReactNode, useEffect, useMemo } from "react";
import { useController } from "@/components/Controller";

export type BucketContext = {
  /** The bucket instance. */
  bucket: Bucket;
};
export const Context = createContext<BucketContext | null>(null);

export type ProviderProps = Pick<BucketProps, "name" | "lock"> & {
  children?: ReactNode;
};

/**
 * Provides a bucket to its children.
 */
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
