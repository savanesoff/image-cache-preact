/**
 * If you render the same image multiple times at different sizes,
 * each rendered image will consume a different set of video memory.
 * This is because each rendered image is stored as a separate bitmap in memory,
 * and the size of the bitmap depends on the dimensions of the rendered image.
 * When an image is rendered at a certain size, the browser engine creates a bitmap of that size in memory.
 * The bitmap contains the pixel data for the rendered image.
 * If the same image is rendered at a different size, a new bitmap of the new size is created in memory.
 * So, even though it's the same image, if it's rendered at different sizes,
 * each size will have its own bitmap in memory, and each bitmap will consume a different amount of memory.
 * The larger the rendered image, the larger the bitmap, and the more memory it consumes.
 *
 * In most modern web browsers, if you render the same image twice with the same dimensions, t
 * he browser will not duplicate the bitmap data in memory.
 * Instead, it will cache the image after it's loaded for the first time, and then reuse the cached image for subsequent renderings.
 * This is an optimization that helps to reduce memory usage and improve performance.
 * When an image is loaded, the browser creates a decoded bitmap of the image and stores it in memory.
 * When the same image is used again, the browser can skip the loading and decoding steps and directly use the cached bitmap.
 */

import { Bucket } from "../Bucket";
import {
  EventHandler as LoaderEventHandler,
  Loader,
  Events as LoaderEvents,
  LoaderProps,
} from "../loader";
type Events =
  | LoaderEvents
  | "size"
  | "clear"
  | "request-load"
  | "request-render"
  | "clear-size";

type Event<T extends Events> = {
  event: T;
  target: T extends LoaderEvents ? Loader : Img;
};
type EventHandler<T extends Events> = (event: Event<T>) => void;

type Size = {
  width: number;
  height: number;
};

type ImgProps = LoaderProps;

type RenderState = {
  size: Size;
  bytes: number;
  rendered: boolean;
  requested: boolean;
  buckets: Set<Bucket>;
};

export class Img extends Loader {
  // reference to buckets this image is associated with
  readonly buckets = new Set<Bucket>();
  /** Image element that helps us hold on to blob url data in ram */
  readonly element: HTMLImageElement;
  /** Tracks render data for each image size */
  readonly renderState = new Map<string, RenderState>();

  gotSize = false;
  loadRequested = false;

  constructor({ mimeType = "image/jpeg", ...props }: ImgProps) {
    super({
      mimeType,
      ...props,
    });
    this.element = new Image(); // need to get actual size of image
    this.on("loadend", this.onDataLoaded); // called by a loader process
  }

  /**
   * Called when the image data is loaded
   * Creates a blob URL for the image data to get its size
   */
  onDataLoaded() {
    this.element.onload = this.onBlobAssigned;
    this.element.onerror = this.onBlobError;
    this.element.src = URL.createObjectURL(this.blob);
  }

  /**
   * Called when the image data is loaded
   */
  private onBlobAssigned = () => {
    this.element.onload = null;
    this.element.onerror = null;
    // not really needed to have size separate from image props, but image can be cleared to free memory
    this.gotSize = true;
    this.emit("size", {
      with: this.element.width,
      height: this.element.height,
    });
  };

  private onBlobError = () => {
    this.element.onload = null;
    this.element.onerror = null;
    this.emit("error");
  };

  clear() {
    this.element.onload = null;
    this.element.onerror = null;
    this.element.src = "";
    this.gotSize = false;
    URL.revokeObjectURL(this.element.src);
    for (const [, state] of this.renderState) {
      this.clearSize(state.size);
    }
    this.emit("clear");
  }

  /**
   * Returns the size of the image in bytes as a 4 channel RGBA image
   */
  getBytesVideo(size: Size) {
    // TODO: handle different image types
    return size.width * size.height * 4;
  }

  addBucket(bucket: Bucket) {
    this.buckets.add(bucket);
  }

  removeBucket(bucket: Bucket) {
    this.buckets.delete(bucket);
  }

  /**
   * Returns true if the image is locked by any bucket
   */
  isLocked() {
    for (const bucket of this.buckets) {
      if (bucket.isLocked()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Requesting src triggers the loading of the image data into the cache
   */
  renderSize({
    size,
    bucket,
  }: {
    size: Size;
    bucket: Bucket;
  }): HTMLImageElement | null {
    const key = `${size.width}x${size.height}`;
    let state = this.renderState.get(key);

    if (!state) {
      state = {
        size,
        bytes: this.getBytesVideo(size),
        rendered: false,
        requested: false,
        buckets: new Set(),
      };
      this.renderState.set(key, state);
    }
    // general load
    if (!this.loadRequested) {
      this.loadRequested = true;
      this.emit("request-load"); // for master to handler
      return null;
    }

    if (!this.gotSize) {
      return null;
    }

    if (!state.requested) {
      state.requested = true;
      state.buckets.add(bucket);
      bucket.addSize({ size: key, image: this });
      this.emit("request-render", state);
      return null;
    }

    if (!state.rendered) {
      return null;
    }

    return this.element;
  }

  clearSize(size: Size) {
    const key = `${size.width}x${size.height}`;
    const state = this.renderState.get(key);
    if (!state) {
      return;
    }

    state.rendered = false;
    state.requested = false;
    for (const bucket of state.buckets) {
      bucket.clearSize({ size: key, image: this });
    }
    this.emit("clear-size", { key, size });
  }

  on<T extends Events>(event: T, handler: EventHandler<T>): this {
    super.on(event as LoaderEvents, handler as LoaderEventHandler);
    return this;
  }

  emit(event: Events, data?: Record<string, unknown>): boolean {
    return super.emit(event as LoaderEvents, data);
  }
}
