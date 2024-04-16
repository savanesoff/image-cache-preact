import { MemoryEvent, MemoryStats, useController } from "@cache";
import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@demo/components";

export const RamUsage = () => {
  const { controller } = useController();
  const [stats, setStats] = useState<MemoryStats>(controller.ram.getStats());

  const onBytesAdded = useCallback((event: MemoryEvent<"bytes-added">) => {
    setStats(event.target.getStats());
  }, []);

  useEffect(() => {
    // because by the time this effect runs, the video might have already been loaded
    setStats(controller.ram.getStats());
    controller.ram.on("bytes-added", onBytesAdded);
    return () => {
      controller.ram.off("bytes-added", onBytesAdded);
    };
  }, [controller, onBytesAdded]);

  return (
    <>
      <StatusBadge
        text={`RAM: ${stats.used.units} / ${stats.state.size}${stats.state.units} [${stats.used.prs.toFixed(2)}%]`}
      />
    </>
  );
};
