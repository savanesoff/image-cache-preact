import { Img } from "@/image";
import { Logger } from "@/logger";
import { ImgEvent } from "@/image";
import { Controller } from "@/controller";
import { RenderRequest, RenderRequestEvent } from "@/request";

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "numeric",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hourCycle: "h23",
};

export type BucketEventTypes =
  | "progress"
  | "loadend"
  | "error"
  | "rendered"
  | "clear"
  | "loading";

export type ProgressEvent = {
  progress: number;
};
export type ErrorEvent = {
  error: string;
};
export type LoadEvent = {
  loaded: boolean;
};
export type RenderEvent = {
  rendered: boolean;
};

export type BucketEvent<T extends BucketEventTypes> = {
  type: T;
  target: Bucket;
} & (T extends "progress" ? ProgressEvent : unknown) &
  (T extends "error" ? ErrorEvent : unknown) &
  (T extends "loadend" ? LoadEvent : unknown) &
  (T extends "rendered" ? RenderEvent : unknown);

export type BucketEventHandler<T extends BucketEventTypes> = (
  event: BucketEvent<T>,
) => void;

export interface BucketProps {
  name: string;
  lock?: boolean;
  controller: Controller;
}

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
    // emit the render event only if all requests are rendered
    for (const request of this.requests) {
      this.rendered = !request.rendered ? false : this.rendered;
    }

    this.log.verbose([
      `Request Rendered ${this.name}`,
      new Date().toLocaleTimeString("en-US", TIME_FORMAT),
      event.target,
    ]);

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
    this.log.verbose([
      `Image loaded ${this.name}`,
      new Date().toLocaleTimeString("en-US", TIME_FORMAT),
      event,
    ]);
    for (const image of this.images) {
      this.loaded = !image.gotSize ? false : this.loaded;
    }
    this.loading = !this.loaded;
    this.loadProgress = 1;
    if (this.loaded) {
      this.emit("loadend", { loaded: this.loaded });
      this.log.info([
        `Loaded ${this.name}`,
        new Date().toLocaleTimeString("en-US", TIME_FORMAT),
      ]);
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
  getBytesRam() {
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

  getImages() {
    return [...this.images];
  }

  on<T extends BucketEventTypes>(
    event: T,
    handler: BucketEventHandler<T>,
  ): this {
    super.on(event, handler);
    return this;
  }

  off<T extends BucketEventTypes>(
    event: T,
    handler: BucketEventHandler<T>,
  ): this {
    super.off(event, handler);
    return this;
  }

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
