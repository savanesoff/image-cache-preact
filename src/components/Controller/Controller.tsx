/**
 * The `ControllerProvider` component is a React context provider for a `Controller` instance.
 * It provides a `ControllerContext` that contains a `Controller` instance.
 */
import { createContext, ReactNode, useMemo } from "react";
import { ControllerProps, Controller } from "@lib";

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
  ...props
}: ControllerProviderProps) {
  const controller = useMemo(() => {
    return new Controller(props);
  }, [props]);

  return (
    <ControllerContext.Provider value={{ controller }}>
      {children}
    </ControllerContext.Provider>
  );
}
