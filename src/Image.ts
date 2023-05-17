import { Bucket } from "./Bucket";
import { Loader } from "./loader";
import Logger from "./logger";

export class ImageItem extends Logger {
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
  static readonly compression = 1.18;

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

  /**
   * Called by the network queue when it's time to load this image
   */
  onLoadStart() {
    this.loading = true;
    this.emit("loadstart", this);
  }

  onLoaderProgress(loader: Loader) {
    this.loadProgress = loader.progress;
    this.bytes = loader.bytesTotal;
    this.bytesLoaded = loader.bytesLoaded;
    this.emit("progress", this);
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
    // image is ready to be used from here on
    this.emit("loaded", this);
  };

  onLoadError = () => {
    this.loading = false;
    this.loaded = false;
    this.cached.onload = null;
    this.cached.onerror = null;
    this.emit("error", this);
  };

  clear() {
    this.cached.onload = null;
    this.cached.onerror = null;
    this.cached.src = "";
    this.unblit();
    this.emit("clear", this);
    this.removeAllListeners();
  }

  blit() {
    if (this.rendered) return;
    this.cached.style.position = "absolute";
    this.cached.style.top = "0";
    this.cached.style.left = Math.round(Math.random() * 95) + "%";
    this.cached.style.opacity = "0.01";
    this.cached.style.zIndex = "9999999999";
    this.cached.width = this.cached.height = 1;

    window.document.body.appendChild(this.cached);

    window.requestAnimationFrame(() => {
      this.rendered = true;
      this.emit("blit", this);
    });
  }

  forceRender() {
    const imgCanvas = document.createElement("canvas");
    document.body.appendChild(imgCanvas);
    const imgContext = imgCanvas.getContext("2d");

    // Make sure canvas is as big as the picture
    imgCanvas.width = this.cached.width;
    imgCanvas.height = this.cached.height;

    // Draw image into canvas element
    imgContext?.drawImage(
      this.cached,
      0,
      0,
      this.cached.width,
      this.cached.height
    );
  }

  unblit() {
    if (!this.rendered) return;
    this.rendered = false;
    this.cached.remove();
    this.emit("unblit", this);
  }

  canClear() {
    for (const bucket of this.buckets) {
      if (bucket.isLocked()) {
        return false;
      }
    }
    return true;
  }

  src(): string | undefined {
    if (this.rendered) {
      return this.cached.src;
    }
  }
}
