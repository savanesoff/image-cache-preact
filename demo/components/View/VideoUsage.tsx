import { MemoryEvent, MemoryStats, useController } from "@cache";
import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@demo/components";

export const VideoUsage = () => {
  const { controller } = useController();
  const [stats, setStats] = useState<MemoryStats>(controller.video.getStats());

  const onBytesAdded = useCallback((event: MemoryEvent<"bytes-added">) => {
    setStats(event.target.getStats());
  }, []);

  useEffect(() => {
    // because by the time this effect runs, the video might have already been loaded
    setStats(controller.video.getStats());
    controller.video.on("bytes-added", onBytesAdded);
    return () => {
      controller.video.off("bytes-added", onBytesAdded);
    };
  }, [controller, onBytesAdded]);

  return (
    <>
      <StatusBadge
        status="warn"
        text={`Video: ${stats.used.units} / ${stats.state.size}${stats.state.units} [${stats.used.prs.toFixed(2)}%]`}
      />
    </>
  );
};
