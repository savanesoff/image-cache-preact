/**
 * The `Bucket` class manages a set of images and their associated render requests.
 * It extends the `Logger` class, inheriting its logging capabilities.
 *
 * The `Bucket` class maintains a set of `Img` instances, a set of `RenderRequest` instances,
 * and a map of video memory usage by image.
 *
 * The `Bucket` class also maintains several state properties, such as `rendered`, `loading`, `loaded`, `loadProgress`, and `timeout`.
 *
 * The `Bucket` class provides methods to register and unregister a `RenderRequest`,
 * which involves adding or removing the `RenderRequest` from the set,
 * subscribing or unsubscribing to the "rendered" event, and adding or removing the image from the set of images.
 */
import {
  Img,
  ImgEvent,
  Controller,
  RenderRequest,
  RenderRequestEvent,
} from "@lib";
import { Logger } from "@lib/logger";
import { now } from "@utils";

export type BucketEventTypes =
  | "progress"
  | "loadend"
  | "error"
  | "rendered"
  | "clear"
  | "loading"
  | "request-rendered";

type ProgressEvent = {
  /** The progress of the loading operation */
  progress: number;
};
type ErrorEvent = {
  /** The error message */
  error: string;
};
type LoadEvent = {
  /** The loading state */
  loaded: boolean;
};
type RenderEvent = {
  /** The rendered state */
  rendered: boolean;
};

type RequestRenderedEvent = {
  /** The request that was rendered */
  request: RenderRequest;
  /** The progress of the rendering operation */
  progress: number;
};

export type BucketEvent<T extends BucketEventTypes> = {
  /** The type of the event */
  type: T;
  /** The target of the event */
  target: Bucket;
} & (T extends "progress" ? ProgressEvent : unknown) &
  (T extends "error" ? ErrorEvent : unknown) &
  (T extends "loadend" ? LoadEvent : unknown) &
  (T extends "rendered" ? RenderEvent : unknown) &
  (T extends "request-rendered" ? RequestRenderedEvent : unknown);

export type BucketEventHandler<T extends BucketEventTypes> = (
  event: BucketEvent<T>,
) => void;

export interface BucketProps {
  /** The name of the bucket */
  name: string;
  /** Whether the bucket is locked */
  lock?: boolean;
  /** The controller instance */
  controller: Controller;
}

/**
 * Represents a bucket of images and their associated render requests.
 * Emits events when images are loaded, when the bucket is cleared, and when the bucket is rendered.
 * Also tracks the loading state of the bucket and the progress of the loading operation.
 */
export class Bucket extends Logger {
  readonly images = new Set<Img>();
  readonly requests = new Set<RenderRequest>();
  readonly videoMemory = new Map<string, Set<Img>>();

  rendered = false;
  loading = false;
  loaded = false;
  loadProgress = 0;
  timeout = 0;
  controller: Controller;
  locked: boolean;

  constructor({ name, lock = false, controller }: BucketProps) {
    super({
      name: `Bucket:${name}`,
      logLevel: "verbose",
    });
    this.controller = controller;
    this.locked = lock;
  }

  registerRequest(request: RenderRequest) {
    this.requests.add(request);
    request.on("rendered", this.#onRequestRendered);
    this.#addImage(request.image);
  }

  unregisterRequest(request: RenderRequest) {
    this.requests.delete(request);
    request.off("rendered", this.#onRequestRendered);
    this.#removeImage(request.image);
  }

  #addImage(image: Img) {
    this.images.add(image);
    image.on("loadstart", this.#onImageLoadStart);
    image.on("progress", this.#onImageProgress);
    image.on("size", this.#onImageLoadend);
    image.on("error", this.#onImageError);
  }

  #removeImage(image: Img) {
    if (this.isImageUsed(image)) return;
    this.images.delete(image);
    image.off("loadstart", this.#onImageLoadStart);
    image.off("progress", this.#onImageProgress);
    image.off("size", this.#onImageLoadend);
    image.off("error", this.#onImageError);
  }

  isImageUsed(image: Img) {
    for (const request of this.requests) {
      if (request.image === image) {
        return true;
      }
    }
    return false;
  }

  /**
   * Store image size requests
   * @param event
   * @returns
   */
  #onRequestRendered = (event: RenderRequestEvent<"rendered">) => {
    this.rendered = true;
    let renderedRequests = 0;
    // emit the render event only if all requests are rendered
    for (const request of this.requests) {
      this.rendered = !request.rendered ? false : this.rendered;
      renderedRequests += request.rendered ? 1 : 0;
    }

    const progress = parseFloat(
      (renderedRequests / this.requests.size).toFixed(2),
    );

    this.emit("request-rendered", { request: event.target, progress });

    this.log.verbose([`Request Rendered ${this.name}`, now(), event.target]);

    if (this.rendered) {
      this.emit("rendered", { rendered: this.rendered });
    }
  };

  /**
   * Any image load event will reset the loading state
   * @param event
   */
  #onImageLoadStart = (event: ImgEvent<"loadstart">) => {
    this.loading = true;
    this.loaded = false;
    this.rendered = false;
    this.emit("loading", { image: event.target });
  };

  /**
   * This is expensive and should not be used this way
   * Instead, a getter should be used to calculate the current progress
   * @param event
   */
  #onImageProgress = (event: ImgEvent<"progress">): void => {
    this.loaded = false;
    this.loading = true;
    let progress = 0;
    for (const image of this.images) {
      progress += image.progress;
    }
    this.loadProgress = parseFloat((progress / this.images.size).toFixed(2));
    this.emit("progress", { progress: this.loadProgress });
    this.log.verbose([
      `Progress ${this.name}: ${this.loadProgress}`,
      "event:",
      event,
    ]);
  };

  /**
   * When all images are loaded, emit the loaded event
   *
   * @param event
   * @returns
   */
  #onImageLoadend = (event: ImgEvent<"size">) => {
    this.loaded = true;
    this.log.verbose([`Image loaded ${this.name}`, now(), event]);
    for (const image of this.images) {
      this.loaded = !image.gotSize ? false : this.loaded;
    }
    this.loading = !this.loaded;
    this.loadProgress = 1;
    if (this.loaded) {
      this.emit("loadend", { loaded: this.loaded });
      this.log.info([`Loaded ${this.name}`, now()]);
    }
  };

  /**
   * When an image errors, emit the error event
   * @param event
   */
  #onImageError = (event: ImgEvent<"error">) => {
    this.emit("error", { error: event.statusText });
  };

  /**
   * Calculate the video memory used by the bucket
   * This is expensive and should be used sparingly
   * @returns
   */
  getBytesVideo() {
    let requested = 0;
    let used = 0;
    for (const request of this.requests) {
      requested += request.bytesVideo;
      used += request.rendered ? request.bytesVideo : 0;
    }
    return { requested, used };
  }

  /**
   * Calculate the ram used by the bucket
   * @returns
   */
  getBytesRam(): number {
    let bytes = 0;
    for (const image of this.images) {
      bytes += image.getBytesRam();
    }
    return bytes;
  }

  /**
   * Clear all images from the bucket
   * This will also remove all event listeners
   */
  clear = () => {
    for (const request of this.requests) {
      request.clear();
    }

    this.emit("clear");
    this.removeAllListeners();
  };

  /**
   * Get all images in the bucket
   */
  getImages() {
    return [...this.images];
  }

  //-----------------------   EVENT METHODS   -----------------------

  /**
   * Adds an event listener for the specified event type.
   * @param event - The type of the event.
   * @param handler - The event handler function.
   * @returns The current instance of the Bucket.
   * @override Logger.on
   */
  on<T extends BucketEventTypes>(
    event: T,
    handler: BucketEventHandler<T>,
  ): this {
    return super.on(event, handler);
  }

  /**
   * Removes an event listener for the specified event type.
   * @param event - The type of the event.
   * @param handler - The event handler function to remove.
   * @returns The current instance of the Bucket.
   * @override Logger.off
   */
  off<T extends BucketEventTypes>(
    event: T,
    handler: BucketEventHandler<T>,
  ): this {
    return super.off(event, handler);
  }

  /**
   * Emits an event of the specified type with the specified data.
   * @param type - The type of the event to emit.
   * @param data - The data to emit with the event.
   * @returns True if the event was emitted successfully, false otherwise.
   * @override Logger.emit
   */
  emit<T extends BucketEventTypes>(
    type: T,
    data?: Omit<BucketEvent<T>, "target" | "type">,
  ): boolean {
    return super.emit(type, {
      ...data,
      type,
      target: this,
    });
  }
}
