/**
 * The `ControllerProvider` component is a React context provider for a `Controller` instance.
 * It provides a `ControllerContext` that contains a `Controller` instance.
 */

import { ControllerProps, Controller } from '@lib/controller';
import { createContext, VNode } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';

export type ControllerContextType = {
  controller: Controller;
};
export const ControllerContext = createContext<ControllerContextType | null>(
  null,
);

export type ControllerProviderProps = ControllerProps & {
  children?: VNode | VNode[];
};

/**
 * Provides a controller to its children.
 * @param param0
 * @returns
 */
export function ControllerProvider({
  children,
  gpuDataFull,
  hwRank,
  loaders,
  logLevel,
  name,
  ram,
  renderer,
  units,
  video,
  styles,
}: ControllerProviderProps) {
  const controller = useMemo(
    () =>
      new Controller({
        gpuDataFull,
        hwRank,
        loaders,
        logLevel,
        name,
        ram,
        renderer,
        units,
        video,
        styles,
      }),
    [
      gpuDataFull,
      hwRank,
      loaders,
      logLevel,
      name,
      ram,
      renderer,
      units,
      video,
      styles,
    ],
  );
  useEffect(() => {
    return () => controller.clear();
  }, [controller]);

  return (
    <ControllerContext.Provider value={{ controller }}>
      {children}
    </ControllerContext.Provider>
  );
}
