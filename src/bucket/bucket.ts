import { Img, Size } from "@/image";
import defaultImageURL from "@/assets/default.png";
import { Logger } from "@/logger";
import { Event as ImageEvent } from "@/image";

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "numeric",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hourCycle: "h23",
};

type Events = "loading" | "progress" | "loaded";

type Event = {
  event: Events;
  target: Bucket;
};
type EventHandler = (event: Event) => void;

export interface BucketProps {
  name: string;
  lock?: boolean;
  blit?: boolean;
  load?: boolean;
  urls?: string[];
  defaultURL?: string;
  size?: Size;
}

export class Bucket extends Logger {
  readonly images = new Set<Img>();
  readonly videoMemory = new Map<string, Set<Img>>();

  defaultURL: string;
  rendered = false;
  loading = false;
  loaded = false;
  loadProgress = 0;
  timeout = 0;
  size: Size | null;
  locked: boolean;
  load: boolean;
  /** Data representing all image requests at specific size  */
  sizeRequests = new Map<string, { size: Size; images: Set<Img> }>();

  constructor({
    name,
    defaultURL = defaultImageURL,
    load = false,
    lock = false,
    size,
  }: BucketProps) {
    super({
      name: `Bucket:${name}`,
      logLevel: "verbose",
    });
    this.size = size || null;
    this.locked = lock;
    this.load = load;
    this.defaultURL = defaultURL;
  }

  addImages(images: Img[]) {
    images.forEach((image) => this.addImage(image));
  }

  addImage(image: Img) {
    this.images.add(image);
    image.on("loadstart", this.onImageLoadStart);
    image.on("progress", this.onImageProgress);
    image.on("size", this.onImageLoadend);
    image.on("check-lock", this.onImageLockCheck);
    image.on("size-rendered", this.onImageSizeRendered);
    image.on("size-cleared", this.onImageSizeCleared);
    if (this.load) {
      image.requestLoad();
    }
  }

  removeImage(image: Img) {
    this.images.delete(image);
    image.off("loadstart", this.onImageLoadStart);
    image.off("progress", this.onImageProgress);
    image.off("size", this.onImageLoadend);
    image.off("check-lock", this.onImageLockCheck);
    image.off("size-rendered", this.onImageSizeRendered);
    image.off("size-cleared", this.onImageSizeCleared);
  }
  /**
   * Store image size requests
   * @param event
   * @returns
   */
  onImageSizeRendered(event: ImageEvent<"size-rendered">) {
    // this this bucket isn't part of the request, return
    if (!event.request.buckets.has(this)) {
      return;
    }

    const { request } = event;
    if (!this.sizeRequests.has(request.key)) {
      this.sizeRequests.set(request.key, {
        size: request.size,
        images: new Set(),
      });
    }
    this.sizeRequests.get(request.key)?.images.add(event.target);
  }

  /**
   * Clear the size from the bucket
   * @param event
   */
  onImageSizeCleared = (event: ImageEvent<"size-cleared">) => {
    // this this bucket isn't part of the request, return
    if (!event.request.buckets.has(this)) {
      return;
    }
    const { request } = event;
    const sizeMap = this.sizeRequests.get(request.key);
    if (!sizeMap) return;
    sizeMap.images.delete(event.target);
    if (sizeMap.images.size === 0) {
      this.sizeRequests.delete(request.key);
    }
  };

  /**
   * Calculate the video memory used by the bucket
   * This is expensive and should be used sparingly
   * @returns
   */
  getBytesVideo() {
    let bytes = 0;
    for (const [, { size, images }] of this.sizeRequests) {
      for (const image of images) {
        bytes += image.getBytesVideo(size);
      }
    }
    return bytes;
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
   * Increment the lock count on state
   * @param event
   */
  private onImageLockCheck = (event: ImageEvent<"check-lock">) => {
    event.state.locked += this.locked && this.images.has(event.target) ? 1 : 0;
  };

  /**
   * Any image load event will reset the loading state
   * @param event
   */
  private onImageLoadStart = (event: ImageEvent<"loadstart">) => {
    this.loading = true;
    this.loaded = false;
    this.rendered = false;
    this.emit("loading", event);
  };

  /**
   * This is expensive and should not be used this way
   * Instead, a getter should be used to calculate the current progress
   * @param event
   */
  private onImageProgress = (event: ImageEvent<"progress">): void => {
    let progress = 0;
    for (const image of this.images) {
      progress += image.progress;
    }
    this.loadProgress = progress / this.images.size;
    this.emit("progress", event);
  };

  /**
   * When all images are loaded, emit the loaded event
   *
   * @param event
   * @returns
   */
  private onImageLoadend = (event: ImageEvent<"size">) => {
    for (const image of this.images) {
      if (!image.loaded) return;
    }
    this.loaded = true;
    this.loading = false;
    this.loadProgress = 1;
    this.emit("loaded", event);
    this.log.info([
      `Loaded ${this.name}`,
      new Date().toLocaleTimeString("en-US", TIME_FORMAT),
    ]);
  };

  /**
   * Clear all images from the bucket
   * This will also remove all event listeners
   */
  clear = () => {
    this.images.forEach(this.removeImage);
    this.removeAllListeners();
  };

  getImages() {
    return [...this.images];
  }

  on(event: Events, handler: EventHandler): this {
    super.on(event, handler);
    return this;
  }

  emit(event: Events, data: Record<string, unknown> = {}): boolean {
    return super.emit(event, {
      ...data,
      event,
      target: this,
    });
  }
}
