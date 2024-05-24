import { MemoryEvent, MemoryStats, useController } from '@cache';
import { useCallback, useEffect, useMemo, useState } from 'preact/compat';
import { StatusBadge } from '@demo/components';

export const RamUsage = () => {
  const { controller } = useController();
  const [stats, setStats] = useState<MemoryStats>(controller.ram.getStats());
  const [overflow, setOverflow] = useState(false);

  const onUpdate = useCallback((event: MemoryEvent<'update'>) => {
    setStats(event.target.getStats());
    setOverflow(event.overflow);
  }, []);

  useEffect(() => {
    // because by the time this effect runs, the video might have already been loaded
    setStats(controller.ram.getStats());
    controller.ram.on('update', onUpdate);
    return () => {
      controller.ram.off('update', onUpdate);
    };
  }, [controller, onUpdate]);

  const text = useMemo(
    () =>
      [
        `RAM (${stats.state.units})`,
        `${stats.used.units.toFixed(2)}/${stats.state.size}`,
        `[${stats.used.prs.toFixed(2)}%]`,
        `${overflow ? 'ovfl!' : ''}`,
      ].join(' '),
    [overflow, stats],
  );

  return <StatusBadge status={overflow ? 'error' : 'off'} text={text} />;
};
