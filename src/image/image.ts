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

import {
  EventHandler as LoaderEventHandler,
  Loader,
  Events as LoaderEvents,
  LoaderProps,
} from "@/loader";
import { RenderRequest, Event as RenderRequestEvent } from "./render-request";

type Events =
  | LoaderEvents
  | "size"
  | "clear"
  | "render-request-rendered"
  | "render-request-added"
  | "render-request-removed"
  | "error";

export type Size = {
  width: number;
  height: number;
};

export type Event<T extends Events> = {
  event: T;
  target: T extends LoaderEvents ? Loader : Img;
} & (T extends "size" ? { size: Size } : unknown) &
  (T extends
    | "render-request-rendered"
    | "render-request-removed"
    | "render-request-added"
    ? { request: RenderRequest }
    : unknown);

export type LockState = {
  locked: number;
};

export type EventHandler<T extends Events> = (event: Event<T>) => void;

export type ImgProps = LoaderProps;

export class Img extends Loader {
  /** Image element that helps us hold on to blob url data in ram */
  readonly element: HTMLImageElement;
  /** Tracks render data for each image size */
  readonly renderRequests = new Set<RenderRequest>();

  gotSize = false;
  decoded = false;
  bytesUncompressed = 0;
  constructor({
    headers = {
      "Content-Type": "image/jpeg",
    },
    ...props
  }: ImgProps) {
    super({
      headers,
      ...props,
    });
    this.element = new Image(); // need to get actual size of image
    this.on("loadend", this.onLoadEnd); // called by a loader process
  }

  /**
   * Called when the image data is loaded
   * Creates a blob URL for the image data to get its size
   */
  private onLoadEnd() {
    if (!this.blob) {
      throw new Error("No blob data found!");
    }
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
    this.bytesUncompressed = this.getBytesVideo(this.element);
    this.emit("size", {
      size: { with: this.element.width, height: this.element.height },
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
    this.bytesUncompressed = 0;
    URL.revokeObjectURL(this.element.src);
    for (const request of this.renderRequests) {
      this.unregisterRequest(request);
    }
    this.emit("clear");
    this.removeAllListeners();
  }

  #onRendered = (event: RenderRequestEvent<"rendered">) => {
    this.decoded = true;
    this.emit("render-request-rendered", { request: event.target });
  };

  registerRequest(request: RenderRequest) {
    this.renderRequests.add(request);
    request.on("rendered", this.#onRendered);
    this.emit("render-request-added", { request });
  }

  unregisterRequest(request: RenderRequest) {
    request.off("rendered", this.#onRendered);
    this.renderRequests.delete(request);
    this.emit("render-request-removed", { request });
  }

  /**
   * Returns true if the image is locked by any request
   */
  isLocked() {
    for (const request of this.renderRequests.values()) {
      if (request.isLocked()) {
        return true;
      }
    }
    return false;
  }

  /*
   * Memory Usage Summary:
   *
   * When an image is loaded as a Blob, the data represents the image file as it is stored on disk,
   * which is typically compressed (for formats like JPEG, PNG, etc.).
   * This Blob data is stored in the browser's memory, not in the JavaScript heap.
   * Blobs are a browser feature and are managed by the browser, not by the JavaScript engine.
   *
   * When the browser renders an image, it needs to decode (uncompressed) the image data into a bitmap that can be drawn to the screen.
   * This decoded image data is also stored in the browser's memory. It's not stored in the JavaScript heap
   * because it's not directly accessible from JavaScript. The decoded image data is managed by the browser's rendering engine.
   *
   * The getBytesRam method in this code calculates the total memory used by the image,
   * including both the compressed Blob data and the uncompressed bitmap data (if the image has been decoded).
   *
   * The getBytesVideo method calculates the size of the uncompressed bitmap data based on the image dimensions
   * and assuming 4 bytes per pixel (which is typical for an RGBA image).
   *
   * These calculations assume that the entire image is decoded into a bitmap as soon as it's rendered,
   * which might not always be the case depending on the browser's image decoding strategy.
   * They also don't account for any additional memory that might be used by the browser to manage the image data.
   *
   * So, while these methods can give a rough estimate of the memory usage, they won't give an exact number.
   * For more precise memory profiling, you would need to use browser-specific tools or APIs.
   */
  getBytesRam() {
    // add together compressed size and uncompressed size
    return this.bytes + (this.decoded ? this.bytesUncompressed : 0);
  }

  /**
   * Returns the size of the image in bytes as a 4 channel RGBA image
   */
  getBytesVideo(size: Size) {
    // TODO: handle different image types
    return size.width * size.height * 4;
  }

  on<T extends Events>(event: T, handler: EventHandler<T>): this {
    super.on(event as LoaderEvents, handler as LoaderEventHandler);
    return this;
  }

  off<T extends Events>(event: T, handler: EventHandler<T>): this {
    super.off(event as LoaderEvents, handler as LoaderEventHandler);
    return this;
  }

  emit(event: Events, data?: Record<string, unknown>): boolean {
    return super.emit(event as LoaderEvents, data);
  }
}
