import { MemoryEvent, MemoryStats, useController } from "@cache";
import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@demo/components";

export const VideoUsage = () => {
  const { controller } = useController();
  const [stats, setStats] = useState<MemoryStats>(controller.video.getStats());

  const onBytesAdded = useCallback((event: MemoryEvent<"update">) => {
    setStats(event.target.getStats());
  }, []);

  useEffect(() => {
    // because by the time this effect runs, the video might have already been loaded
    setStats(controller.video.getStats());
    controller.video.on("update", onBytesAdded);
    return () => {
      controller.video.off("update", onBytesAdded);
    };
  }, [controller, onBytesAdded]);

  return (
    <StatusBadge
      status="warn"
      text={`VID (${stats.state.units}) ${stats.used.units.toFixed(2)}/${stats.state.size} [${stats.used.prs.toFixed(2)}%]`}
    />
  );
};
