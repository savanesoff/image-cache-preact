import { useContext } from "react";
import { Context } from "./Controller";

export const useController = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useController must be used within a ControllerProvider");
  }
  return context;
};
