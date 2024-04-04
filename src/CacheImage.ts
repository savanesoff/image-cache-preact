import { Bucket } from "./Bucket";
import BlitQueue from "./blit-queue";
import {
  EventHandler as LoaderEventHandler,
  Loader,
  Events as LoaderEvents,
  MIMEType,
} from "./loader";
type Events = LoaderEvents | "size" | "blit" | "unblit" | "clear";

type Event<T extends Events> = {
  event: T;
  target: T extends LoaderEvents ? Loader : CacheImage;
};
type EventHandler<T extends Events> = (event: Event<T>) => void;

type ImageSize = {
  width: number;
  height: number;
};

type CacheImageOptions = {
  url: string;
  mimeType?: MIMEType;
  retry: number;
  renderSize: ImageSize;
};

export class CacheImage extends Loader {
  static readonly blitQueue = new BlitQueue();
  // reference to buckets this image is associated with
  readonly buckets = new Set<Bucket>();
  readonly cached: HTMLImageElement;
  requested = false;
  rendered = false;
  size: ImageSize = { width: 0, height: 0 };
  renderSize: ImageSize = { width: 0, height: 0 };

  constructor({
    url,
    mimeType = "image/jpeg",
    retry,
    renderSize,
  }: CacheImageOptions) {
    super({
      url,
      mimeType,
      retry,
    });
    this.renderSize = renderSize;
    this.cached = new Image();
    this.on("loadend", this.onDataLoaded);
  }

  setRenderSize({ width, height }: ImageSize) {
    this.unblit();
    this.renderSize = { width, height };
  }

  onDataLoaded() {
    this.cached.onload = this.onBlobAssigned;
    this.cached.onerror = this.onBlobError;
    this.cached.src = URL.createObjectURL(this.blob);
  }

  private onBlobAssigned = () => {
    this.cached.onload = null;
    this.cached.onerror = null;
    this.size = { width: this.cached.width, height: this.cached.height };
    this.emit("size");
  };

  private onBlobError = () => {
    this.cached.onload = null;
    this.cached.onerror = null;
    this.emit("error");
  };

  clear() {
    this.cached.onload = null;
    this.cached.onerror = null;
    this.cached.src = "";
    this.unblit();
    this.emit("clear");
  }

  blit() {
    if (this.rendered) return;
    if (!this.renderSize.width || !this.renderSize.height) {
      this.log.error(["Cannot blit image without size"]);
      return;
    }
    CacheImage.blitQueue.add(this.render);
  }

  unblit() {
    if (!this.rendered) return;
    this.rendered = false;
    this.cached.remove();
    this.emit("unblit");
  }

  render = () => {
    this.cached.style.position = "absolute";
    this.cached.style.top = "0";
    this.cached.style.left = Math.round(Math.random() * 5) + "%";
    this.cached.style.opacity = "0.001";
    this.cached.style.zIndex = "9999999999";
    this.cached.style.pointerEvents = "none";
    this.cached.width = this.renderSize.width;
    this.cached.height = this.renderSize.height;
    window.document.body.appendChild(this.cached);
    this.rendered = true;
    this.emit("blit");
  };

  isLocked() {
    for (const bucket of this.buckets) {
      if (bucket.isLocked()) {
        return true;
      }
    }
    return false;
  }

  src(): string | undefined {
    if (this.rendered) {
      return this.cached.src;
    }
  }

  on<T extends Events>(event: T, handler: EventHandler<T>): this {
    super.on(event as LoaderEvents, handler as LoaderEventHandler);
    return this;
  }

  emit(event: Events): boolean {
    return super.emit(event as LoaderEvents);
  }
}
