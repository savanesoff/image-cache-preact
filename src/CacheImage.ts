import { Bucket } from "./Bucket";
import BlitQueue from "./blit-queue";
import { Loader } from "@/loader";
import { Logger } from "@/logger";

export class CacheImage extends Logger {
  static readonly blitQueue = new BlitQueue();
  readonly url: string;
  // reference to buckets this image is associated with
  readonly buckets = new Set<Bucket>();
  readonly cached: HTMLImageElement;
  bytes = 0;
  bytesLoaded = 0;
  requested = false;
  loaded = false;
  loading = false;
  rendered = false;
  loadProgress = 0;
  size = { width: 0, height: 0 };
  sizeRender = { width: 0, height: 0 };

  constructor(url: string) {
    super({
      name: "ImageItem",
      logLevel: "verbose",
    });
    this.url = url;
    this.cached = new Image();
  }

  /**
   * Keep of Buckets this image is associated with
   */
  addBucket(bucket: Bucket) {
    this.buckets.add(bucket);
  }

  /**
   * Remove a Bucket from this image
   */
  removeBucket(bucket: Bucket) {
    this.buckets.delete(bucket);
  }

  setSize({ width, height }: { width: number; height: number }) {
    this.unblit();
    this.sizeRender = { width, height };
  }

  emitSubscribers(type: string) {
    for (const bucket of this.buckets) {
      bucket.emit(type, this);
    }
    this.emit(type, this);
  }

  /**
   * Called by the network queue when it's time to load this image
   */
  onLoadStart() {
    this.loading = true;
    this.emitSubscribers("loadstart");
  }

  onLoaderProgress(loader: Loader) {
    this.loadProgress = loader.progress;
    this.bytes = loader.bytesTotal;
    this.bytesLoaded = loader.bytesLoaded;
    this.emitSubscribers("progress");
  }

  assignBlob(blob: Blob) {
    this.cached.onload = this.onBlobAssigned;
    this.cached.onerror = this.onLoadError;
    this.bytes = this.bytesLoaded = blob.size;
    this.cached.src = window.URL.createObjectURL(blob);
  }

  private onBlobAssigned = () => {
    this.loading = false;
    this.loaded = true;
    this.cached.onload = null;
    this.cached.onerror = null;
    this.size = { width: this.cached.width, height: this.cached.height };
    // image is ready to be used from here on
    this.emitSubscribers("loaded");
  };

  onLoadError = () => {
    this.loading = false;
    this.loaded = false;
    this.cached.onload = null;
    this.cached.onerror = null;
    this.emitSubscribers("error");
  };

  clear() {
    this.cached.onload = null;
    this.cached.onerror = null;
    this.cached.src = "";
    this.unblit();
    this.emitSubscribers("clear");
  }

  blit() {
    if (this.rendered) return;
    if (!this.sizeRender.width || !this.sizeRender.height) {
      this.log.error(["Cannot blit image without size"]);
      return;
    }
    this.cached.style.position = "absolute";
    this.cached.style.top = "0";
    this.cached.style.left = Math.round(Math.random() * 5) + "%";
    this.cached.style.opacity = "0.001";
    this.cached.style.zIndex = "9999999999";
    this.cached.style.pointerEvents = "none";
    this.cached.width = this.sizeRender.width;
    this.cached.height = this.sizeRender.height;

    CacheImage.blitQueue.add(this.render);
  }

  private render = () => {
    window.document.body.appendChild(this.cached);
    this.rendered = true;
    this.emitSubscribers("blit");
  };

  unblit() {
    if (!this.rendered) return;
    this.rendered = false;
    this.cached.remove();
    this.emitSubscribers("unblit");
  }

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
}
