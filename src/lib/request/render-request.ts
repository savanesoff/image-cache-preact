/**
 * Module for rendering requests.
 * Each request is associated with an image and a bucket. Where an image can
 * have multiple requests associated with it, a bucket can have multiple images
 */
import { Bucket } from "@lib/bucket";
import { Img, ImgEvent, ImgProps, Size } from "@lib/image";
import { Logger } from "@lib/logger";
import { FrameQueue, RendererProps } from "@lib/frame-queue";
import { renderer } from "./renderer";

export type RenderRequestProps = ImgProps & {
  size: Size;
  bucket: Bucket;
};

export type RenderRequestEventTypes =
  | "rendered"
  | "clear"
  | "loadend"
  | "processing"
  | "loadstart"
  | "progress"
  | "error"
  | "render";

export type RenderRequestEvent<T extends RenderRequestEventTypes> = {
  type: T;
  target: RenderRequest;
} & (T extends "error" ? Omit<ImgEvent<"error">, "target"> : unknown) &
  (T extends "progress" ? Omit<ImgEvent<"progress">, "target"> : unknown) &
  (T extends "render" ? RendererProps : unknown) &
  (T extends "loadstart" ? Omit<ImgEvent<"loadstart">, "target"> : unknown);

export type RenderRequestEventHandler<T extends RenderRequestEventTypes> = (
  event: RenderRequestEvent<T>,
) => void;

/**
 * Represents a render request for an image.
 */
export class RenderRequest extends Logger {
  size: Size;
  rendered: boolean;
  image: Img;
  bucket: Bucket;
  bytesVideo: number;
  readonly frameQueue: FrameQueue;

  /**
   * Constructs a new RenderRequest instance.
   * @param size - The size of the image.
   * @param bucket - The bucket containing the image.
   * @param props - Additional properties for the request.
   */
  constructor({ size, bucket, ...props }: RenderRequestProps) {
    super({ name: "RenderRequest", logLevel: "verbose" });
    this.size = size;
    this.rendered = false;
    this.bucket = bucket;
    this.frameQueue = this.bucket.controller.frameQueue;
    this.image = this.bucket.controller.getImage(props);
    this.bytesVideo = this.image.getBytesVideo(size, true);
    this.image.registerRequest(this);
    this.bucket.registerRequest(this);

    this.image.on("loadstart", this.#onloadStart);
    this.image.on("progress", this.#onProgress);
    this.image.on("error", this.#onImageError);
    if (!this.image.loaded) {
      this.image.on("size", this.request);
    } else {
      this.request();
    }
  }

  #onImageError = (event: ImgEvent<"error">) => {
    this.emit("error", event);
  };
  #onProgress = (event: ImgEvent<"progress">) => {
    this.emit("progress", event);
  };
  #onloadStart = (event: ImgEvent<"loadstart">) => {
    this.emit("loadstart", event);
  };

  /**
   * Requests the image to be rendered.
   */
  request = () => {
    this.log.verbose(["Requesting render"]);
    // request render
    this.emit("loadend");
    this.frameQueue.add(this);
  };

  /**
   * Clears the render request.
   */
  clear() {
    this.image.unregisterRequest(this);
    this.bucket.unregisterRequest(this);
    this.image.off("size", this.request);
    this.image.off("loadstart", this.#onloadStart);
    this.image.off("progress", this.#onProgress);
    this.image.off("error", this.#onImageError);
    this.emit("clear");
    this.removeAllListeners();
  }

  /**
   * Checks if the render request is locked.
   * @returns True if the render request is locked, false otherwise.
   */
  isLocked() {
    return this.bucket.locked;
  }

  /**
   * The default render function.
   * @param props
   */
  render({ renderTime }: RendererProps) {
    this.emit("processing");
    const isRendered = renderTime === 0;
    // if renderer provided, call it
    if (!isRendered && this.bucket.controller.renderer) {
      this.bucket.controller.renderer({ request: this, renderTime });
    } else if (!isRendered && this.emit("render", { renderTime }) !== true) {
      renderer({ request: this, renderTime });
    }

    setTimeout(() => {
      this.rendered = true;
      this.emit("rendered");
    }, renderTime);
  }

  /**
   * Adds an event listener for the specified event type.
   * @param type - The type of the event.
   * @param handler - The event handler function.
   * @returns The current instance of RenderRequest.
   */
  on<T extends RenderRequestEventTypes>(
    type: T,
    handler: RenderRequestEventHandler<T>,
  ): this {
    return super.on(type, handler);
  }

  /**
   * Removes an event listener for the specified event type.
   * @param type - The type of the event.
   * @param handler - The event handler function.
   * @returns The current instance of RenderRequest.
   */
  off<T extends RenderRequestEventTypes>(
    type: T,
    handler: RenderRequestEventHandler<T>,
  ): this {
    return super.off(type, handler);
  }

  /**
   * Emits an event of the specified type.
   * @param type - The type of the event.
   * @param data - Additional data for the event.
   * @returns True if the event was emitted successfully, false otherwise.
   */
  emit<T extends RenderRequestEventTypes>(
    type: T,
    data?: Omit<RenderRequestEvent<T>, "target" | "type">,
  ): boolean {
    return super.emit(type, {
      ...data,
      type,
      target: this,
    });
  }
}
