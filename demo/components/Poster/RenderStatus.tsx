import { useImage } from '@cache';
import { useCallback, useState } from 'preact/compat';
import { StatusBadge } from '../StatusBadge';

export const PosterRenderStatus = () => {
  const [rendered, setRendered] = useState(false);
  const onRendered = useCallback(() => {
    setRendered(true);
  }, []);

  useImage({ onRendered });
  return (
    <StatusBadge
      status={rendered ? 'warn' : 'off'}
      text={rendered ? '100%' : '0%'}
    />
  );
};
