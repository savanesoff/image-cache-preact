import { MutableRefObject, useCallback } from 'preact/compat';
import { RefCallback } from 'preact';

export type MergeRefsType<T> =
  | RefCallback<T | null>
  | MutableRefObject<T | null>
  | null;

export function mergeRefs<T>(
  ...refs: (RefCallback<T | null> | MutableRefObject<T | null> | null)[]
): RefCallback<T | null> {
  return (value: T | null) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as MutableRefObject<T | null>).current = value;
      }
    });
  };
}

export function useMergeRefs<T>(...refs: MergeRefsType<T>[]): MergeRefsType<T> {
  return useCallback(
    (value: T | null) => {
      refs.forEach(ref => {
        if (typeof ref === 'function') {
          ref(value);
        } else if (ref != null) {
          (ref as MutableRefObject<T | null>).current = value;
        }
      });
    },
    [refs],
  );
}
