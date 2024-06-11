/**
 * The `useImage` hook provides a way to subscribe to events from an `Img` instance and its associated `RenderRequest`.
 * It is meant to be used within a component that is a child of `ImageProvider`.
 *
 * The `useImage` hook takes an optional object of event handlers as its argument.
 * Each event handler is a function that will be called when the corresponding event is emitted.
 *
 * The events that can be handled are "progress", "loadend", "error", and "rendered".
 * The "progress", "loadend", and "error" events are emitted by the `Img` instance,
 * while the "rendered" event is emitted by the `RenderRequest`.
 *
 */
import { useContext, useEffect } from 'react';
import { ImageContext, ImageContextType } from './Image';
import { RenderRequestEvent } from 'image-cache-pro';

/**
 * The useImage hook provides a way to listen to events emitted by the image loader.
 */
export type UseImageProps = {
  /** A function that will be called when the load "progress" event is emitted. */
  onProgress?: (event: RenderRequestEvent<'progress'>) => void;
  /** A function that will be called when the load "error" event is emitted. */
  onError?: (event: RenderRequestEvent<'error'>) => void;
  /** A function that will be called when the load "loadend" event is emitted. */
  onLoadend?: (event: RenderRequestEvent<'loadend'>) => void;
  /** A function that will be called when the "rendered" event is emitted. */
  onRendered?: (event: RenderRequestEvent<'rendered'>) => void;
  /**
   * A function that will be called when the "render" event is emitted.
   * Return true if you're rendering the image!
   */
  onRender?: (event: RenderRequestEvent<'render'>) => boolean;
};

/**
 * The useImage hook provides a way to listen to events emitted by the image loader.
 */
export const useImage = ({
  onProgress,
  onError,
  onLoadend,
  onRendered,
  onRender,
}: UseImageProps = {}): ImageContextType => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImage must be used within a ImageProvider');
  }
  const request = context.request;

  useEffect(() => {
    onProgress && request.on('progress', onProgress);
    onError && request.on('error', onError);
    onLoadend && request.on('loadend', onLoadend);
    onRendered && request.on('rendered', onRendered);
    onRender && request.on('render', onRender);

    return () => {
      onProgress && request.off('progress', onProgress);
      onError && request.off('error', onError);
      onLoadend && request.off('loadend', onLoadend);
      onRendered && request.off('rendered', onRendered);
      onRender && request.off('render', onRender);
    };
  }, [onProgress, onError, onLoadend, onRendered, request, onRender]);

  return context;
};
