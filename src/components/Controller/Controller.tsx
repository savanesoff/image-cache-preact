/**
 * The `ControllerProvider` component is a React context provider for a `Controller` instance.
 * It provides a `ControllerContext` that contains a `Controller` instance.
 */
import { createContext, ReactNode, useMemo } from "react";
import { ControllerProps, Controller } from "@/controller";

export type ControllerContext = {
  controller: Controller;
};
export const Context = createContext<ControllerContext | null>(null);

export type ProviderProps = ControllerProps & {
  children: ReactNode;
};

/**
 * Provides a controller to its children.
 * @param param0
 * @returns
 */
export function ControllerProvider({ children, ...props }: ProviderProps) {
  const controller = useMemo(() => {
    return new Controller(props);
  }, [props]);

  return <Context.Provider value={{ controller }}>{children}</Context.Provider>;
}
