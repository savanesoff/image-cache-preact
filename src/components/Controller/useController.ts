import { useContext } from "react";
import { ControllerContext, ControllerContextType } from "./Controller";

/**
 * The useController hook provides a way to access the `Controller` instance from the `ControllerProvider`.
 */
export const useController = (): ControllerContextType => {
  const context = useContext(ControllerContext);
  if (!context) {
    throw new Error("useController must be used within a ControllerProvider");
  }
  return context;
};
