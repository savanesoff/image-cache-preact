import { useContext } from "react";
import { Context } from "./Controller";

/**
 * The useController hook provides a way to access the `Controller` instance from the `ControllerProvider`.
 */
export const useController = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useController must be used within a ControllerProvider");
  }
  return context;
};
