import { ControllerEvent, useController } from "@cache";
import { useCallback, useState } from "react";
import { StatusBadge } from "@demo/components";

export const ImageStats = () => {
  const [count, setCount] = useState(0);
  const onImageAdded = useCallback((event: ControllerEvent<"image-added">) => {
    setCount(event.target.cache.size);
  }, []);
  useController({ onImageAdded });

  return <StatusBadge text={`I: ${count}`} />;
};
