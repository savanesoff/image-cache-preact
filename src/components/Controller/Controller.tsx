import { createContext, ReactNode, useMemo } from "react";
import { ControllerProps, Controller } from "@/controller";

export type ControllerContext = {
  controller: Controller;
};
export const Context = createContext<ControllerContext | null>(null);

export type ProviderProps = ControllerProps & {
  children: ReactNode;
};

export function ControllerProvider({
  loaders,
  logLevel,
  ram,
  video,
  units,
  onRenderRequest,
  children,
}: ProviderProps) {
  const controller = useMemo(() => {
    return new Controller({
      loaders,
      logLevel,
      ram,
      video,
      units,
      onRenderRequest,
    });
  }, [loaders, logLevel, ram, video, units, onRenderRequest]);

  return <Context.Provider value={{ controller }}>{children}</Context.Provider>;
}
