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
import { useContext, useEffect } from 'preact/hooks';
import { ImageContext, ImageContextType } from './Image';
import { RenderRequestEvent } from '@lib/request';
import { ImgEvent } from '@lib/image';

export type UseImageEventTypes =
  | 'progress'
  | 'loadend'
  | 'error'
  | 'rendered'
  | 'render';
/**
 * The useImage hook provides a way to listen to events emitted by the image loader.
 */
export type UseImageEvent<T extends UseImageEventTypes> =
  T extends Exclude<T, 'rendered' | 'render'>
    ? ImgEvent<T>
    : RenderRequestEvent<T>;

/**
 * The useImage hook provides a way to listen to events emitted by the image loader.
 */
export type UseImageProps = {
  /** A function that will be called when the load "progress" event is emitted. */
  onProgress?: (event: UseImageEvent<'progress'>) => void;
  /** A function that will be called when the load "error" event is emitted. */
  onError?: (event: UseImageEvent<'error'>) => void;
  /** A function that will be called when the load "loadend" event is emitted. */
  onLoadend?: (event: UseImageEvent<'loadend'>) => void;
  /** A function that will be called when the "rendered" event is emitted. */
  onRendered?: (event: UseImageEvent<'rendered'>) => void;
  /**
   * A function that will be called when the "render" event is emitted.
   * Return true if you're rendering the image!
   */
  onRender?: (event: UseImageEvent<'render'>) => boolean;
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
  const image = context.request.image;

  useEffect(() => {
    onProgress && image.on('progress', onProgress);
    onError && image.on('error', onError);
    onLoadend && image.on('loadend', onLoadend);
    onRendered && request.on('rendered', onRendered);
    onRender && request.on('render', onRender);

    // this ensures that the loadend event is fired if the image is already loaded
    if (request.image.loaded) {
      onLoadend?.({
        type: 'loadend',
        target: request.image,
        bytes: request.image.bytes,
      });
      onProgress?.({
        type: 'progress',
        target: request.image,
        progress: 1,
      });
    }

    if (request.rendered) {
      onRendered?.({
        type: 'rendered',
        target: request,
        url: request.image.url,
      });
    }

    return () => {
      onProgress && image.off('progress', onProgress);
      onError && image.off('error', onError);
      onLoadend && image.off('loadend', onLoadend);
      onRendered && request.off('rendered', onRendered);
      onRender && request.off('render', onRender);
    };
  }, [image, onProgress, onError, onLoadend, onRendered, request, onRender]);

  return context;
};
