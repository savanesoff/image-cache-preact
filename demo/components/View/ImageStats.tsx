import { ControllerEvent, useController } from "@cache";
import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@demo/components";

export const ImageStats = () => {
  const { controller } = useController();
  const [count, setCount] = useState(0);

  const onImageAdded = useCallback(
    (event: ControllerEvent<"cache-updated">) => {
      setCount(event.target.cache.size);
    },
    [],
  );

  useEffect(() => {
    setCount(controller.cache.size);
    controller.on("cache-updated", onImageAdded);
    return () => {
      controller.off("cache-updated", onImageAdded);
    };
  }, [controller, onImageAdded]);

  return (
    <>
      <StatusBadge text={`Img: ${count}`} />
    </>
  );
};
