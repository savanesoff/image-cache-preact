import { useContext, useEffect } from 'react';
import { ControllerContext, ControllerContextType } from './Controller';
import { ControllerEvent } from '@lib/controller';

type UseControllerProps = {
  /** Event handler for RAM overflow */
  onRamOverflow?: (event: ControllerEvent<'ram-overflow'>) => void;
  /** Event handler for video memory overflow */
  onVideoOverflow?: (event: ControllerEvent<'video-overflow'>) => void;
  /** Event handler for image added */
  onImageAdded?: (event: ControllerEvent<'image-added'>) => void;
  /** Event handler for image removed */
  onImageRemoved?: (event: ControllerEvent<'image-removed'>) => void;
  /** Event handler for cache update */
  onUpdate?: (event: ControllerEvent<'update'>) => void;
  /** Event handler for render request added */
  onRequestAdded?: (event: ControllerEvent<'render-request-added'>) => void;
  /** Event handler for render request removed */
  onRequestRemoved?: (event: ControllerEvent<'render-request-removed'>) => void;
};
/**
 * The useController hook provides a way to access the `Controller` instance from the `ControllerProvider`.
 */
export const useController = ({
  onRamOverflow,
  onVideoOverflow,
  onImageAdded,
  onImageRemoved,
  onUpdate,
  onRequestAdded,
  onRequestRemoved,
}: UseControllerProps = {}): ControllerContextType => {
  const context = useContext(ControllerContext);
  if (!context) {
    throw new Error('useController must be used within a ControllerProvider');
  }

  const controller = context.controller;
  useEffect(() => {
    onRamOverflow && controller.on('ram-overflow', onRamOverflow);
    onVideoOverflow && controller.on('video-overflow', onVideoOverflow);
    onImageAdded && controller.on('image-added', onImageAdded);
    onImageRemoved && controller.on('image-removed', onImageRemoved);
    onUpdate && controller.on('update', onUpdate);
    onRequestAdded && controller.on('render-request-added', onRequestAdded);
    onRequestRemoved &&
      controller.on('render-request-removed', onRequestRemoved);

    // by the time this effect runs, the video might have already been loaded
    if (controller.video.getFreeSpace().prs < 0) {
      onVideoOverflow?.({
        type: 'video-overflow',
        target: controller,
        bytes: controller.video.getStats().used.bytes,
      });
    }

    if (controller.ram.getFreeSpace().prs < 0) {
      onRamOverflow?.({
        type: 'ram-overflow',
        target: controller,
        bytes: controller.ram.getStats().used.bytes,
      });
    }

    return () => {
      onRamOverflow && controller.off('ram-overflow', onRamOverflow);
      onVideoOverflow && controller.off('video-overflow', onVideoOverflow);
      onImageAdded && controller.off('image-added', onImageAdded);
      onImageRemoved && controller.off('image-removed', onImageRemoved);
      onUpdate && controller.off('update', onUpdate);
      onRequestAdded && controller.off('render-request-added', onRequestAdded);
      onRequestRemoved &&
        controller.off('render-request-removed', onRequestRemoved);
    };
  }, [
    controller,
    onImageAdded,
    onImageRemoved,
    onRamOverflow,
    onUpdate,
    onVideoOverflow,
    onRequestAdded,
    onRequestRemoved,
  ]);

  return context;
};
