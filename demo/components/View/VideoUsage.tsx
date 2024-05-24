import { MemoryEvent, MemoryStats, useController } from '@cache';
import { useCallback, useEffect, useMemo, useState } from 'preact/compat';
import { StatusBadge } from '@demo/components';

export const VideoUsage = () => {
  const { controller } = useController();
  const [stats, setStats] = useState<MemoryStats>(controller.video.getStats());
  const [overflow, setOverflow] = useState(false);

  const onUpdate = useCallback((event: MemoryEvent<'update'>) => {
    setStats(event.target.getStats());
    setOverflow(event.overflow);
  }, []);

  useEffect(() => {
    // because by the time this effect runs, the video might have already been loaded
    setStats(controller.video.getStats());
    controller.video.on('update', onUpdate);
    return () => {
      controller.video.off('update', onUpdate);
    };
  }, [controller, onUpdate]);

  const text = useMemo(
    () =>
      [
        `VID (${stats.state.units})`,
        `${stats.used.units.toFixed(2)}/${stats.state.size}`,
        `[${stats.used.prs.toFixed(2)}%]`,
        `${overflow ? 'ovfl!' : ''}`,
      ].join(' '),
    [overflow, stats],
  );

  return <StatusBadge status={overflow ? 'error' : 'warn'} text={text} />;
};
