import { ImgProps, Size, Bucket, Img, Controller, Logger } from "@lib";

export type RenderRequestProps = ImgProps & {
  size: Size;
  bucket: Bucket;
};

export type RenderRequestEventTypes = "rendered" | "clear";

export type RenderRequestEvent<T extends RenderRequestEventTypes> = {
  type: T;
  target: RenderRequest;
};

export type EventHandler<T extends RenderRequestEventTypes> = (
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
  readonly controller: Controller;

  /**
   * Constructs a new RenderRequest instance.
   * @param size - The size of the image.
   * @param bucket - The bucket containing the image.
   * @param props - Additional properties for the request.
   */
  constructor({ size, bucket, ...props }: RenderRequestProps) {
    super({ name: "RenderRequest" });
    this.size = size;
    this.rendered = false;
    this.bucket = bucket;
    this.controller = this.bucket.controller;
    this.image = this.bucket.controller.getImage(props);
    this.bytesVideo = this.image.getBytesVideo(size);
    this.image.registerRequest(this);
    this.bucket.registerRequest(this);
    if (!this.image.loaded) {
      this.image.on("size", this.request);
    } else {
      this.request();
    }
  }

  /**
   * Requests the image to be rendered.
   */
  request = () => {
    // request render
    this.controller.frameQueue.add(this);
  };

  /**
   * Event handler for when the image has been rendered.
   */
  onRendered = () => {
    this.rendered = true;
    this.emit("rendered");
  };

  /**
   * Clears the render request.
   */
  clear() {
    this.image.unregisterRequest(this);
    this.bucket.unregisterRequest(this);
    this.image.off("size", this.request);
    this.emit("clear");
  }

  /**
   * Checks if the render request is locked.
   * @returns True if the render request is locked, false otherwise.
   */
  isLocked() {
    return this.bucket.locked;
  }

  /**
   * Adds an event listener for the specified event type.
   * @param type - The type of the event.
   * @param handler - The event handler function.
   * @returns The current instance of RenderRequest.
   */
  on<T extends RenderRequestEventTypes>(
    type: T,
    handler: EventHandler<T>,
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
    handler: EventHandler<T>,
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
