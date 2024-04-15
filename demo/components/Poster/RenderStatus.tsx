import { useImage } from "@cache";
import { useCallback, useState } from "react";
import { StatusBadge } from "../StatusBadge";

export const PosterRenderStatus = () => {
  const [rendered, setRendered] = useState(false);
  const onRendered = useCallback(() => {
    setRendered(true);
  }, []);

  useImage({ onRendered });
  return (
    <StatusBadge
      status={rendered ? "on" : "off"}
      text={rendered ? "rendered" : `rendering...`}
    />
  );
};
