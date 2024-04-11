import { Logger } from "@/logger";
import { Bucket } from "..";
import { Img, ImgProps, Size } from "./image";

export type RenderRequestProps = ImgProps & {
  size: Size;
  bucket: Bucket;
};

export type Events = "rendered" | "clear";

export type Event<T extends Events> = {
  type: T;
  request: RenderRequest;
};

export type EventHandler<T extends Events> = (event: Event<T>) => void;

export class RenderRequest extends Logger {
  static makeKey: (size: Size) => string = (size) =>
    `${size.width}x${size.height}`;
  size: Size;
  rendered: boolean;
  image: Img;
  bucket: Bucket;
  key: string;
  bytesVideo: number;

  constructor({ size, bucket, ...props }: RenderRequestProps) {
    super({ name: "RenderRequest" });
    this.key = RenderRequest.makeKey(size);
    this.size = size;
    this.rendered = false;
    this.bucket = bucket;
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

  request() {
    // request render
    this.bucket.controller.renderRequest(this, this.onRendered);
  }

  onRendered = () => {
    this.rendered = true;
    this.emit("rendered");
  };

  clear() {
    this.image.unregisterRequest(this);
    this.bucket.unregisterRequest(this);
    this.image.off("size", this.request);
    this.emit("clear");
  }

  isLocked() {
    return this.bucket.locked;
  }

  on<T extends Events>(type: T, handler: EventHandler<T>): this {
    return super.on(type, handler);
  }

  off<T extends Events>(type: T, handler: EventHandler<T>): this {
    return super.off(type, handler);
  }

  emit(type: Events, data: Record<string, unknown> = {}): boolean {
    return super.emit(type, {
      ...data,
      type,
      target: this,
    });
  }
}
