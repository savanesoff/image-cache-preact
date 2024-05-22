/**
 * The `ControllerProvider` component is a React context provider for a `Controller` instance.
 * It provides a `ControllerContext` that contains a `Controller` instance.
 */
import { createContext, ReactNode, useEffect, useState } from 'react';
import { ControllerProps, Controller } from '@lib/controller';

export type ControllerContextType = {
  controller: Controller;
};
export const ControllerContext = createContext<ControllerContextType | null>(
  null,
);

export type ControllerProviderProps = ControllerProps & {
  children: ReactNode;
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
  const [controller, setController] = useState<Controller | null>(null);
  useEffect(() => {
    const newController = new Controller({
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
    });
    setController(newController);
    return () => newController.clear();
  }, [
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
  ]);

  if (!controller) {
    return null; // or some loading state
  }
  return (
    <ControllerContext.Provider value={{ controller }}>
      {children}
    </ControllerContext.Provider>
  );
}
