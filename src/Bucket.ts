import { ImageItem } from "./Image";
import defaultImageURL from "./assets/default.png";
import Logger from "./logger";
import { Master } from "./master";

export type BucketConfig = {
  locked: boolean;
  blit: boolean;
  load: boolean;
};

export class Bucket extends Logger {
  readonly config: BucketConfig = {
    locked: false,
    blit: true,
    load: true,
  };
  readonly images = new Map<string, ImageItem>();
  readonly master: Master = {} as Master;
  loadedImages = new Set<ImageItem>();
  blitImages = new Set<ImageItem>();
  rendered = false;
  loading = false;
  loaded = false;
  defaultURL: string;
  loadProgress = 0;
  timeout = 0;

  constructor(
    master: Master,
    {
      config = {},
      urls = [],
      defaultURL = defaultImageURL,
    }: { config?: Partial<BucketConfig>; urls?: string[]; defaultURL?: string }
  ) {
    super({
      name: "Bucket",
      logLevel: "verbose",
    });
    this.master = master;
    this.config = { ...this.config, ...config };
    this.defaultURL = defaultURL;
    // register bucket with master
    this.master.addBucket(this);
    // add images to bucket if provided
    urls.forEach((url) => this.addImage(url));
  }

  addImage(url: string) {
    const image = this.master.getImage(url);
    this.images.set(url, image);
    image.addBucket(this);
    if (this.config.load) {
      this.master.requestLoad(image);
    }
  }

  unlock() {
    this.config.locked = false;
  }

  lock() {
    this.config.locked = true;
  }

  isLocked() {
    return this.config.locked;
  }

  load() {
    if (this.loaded || this.loading) return;
    this.loading = true;
    this.loaded = false;
    this.rendered = false;
    for (const [, image] of this.images) {
      image.load();
    }

    this.emit("change");
  }

  onLoading(image: ImageItem) {
    this.loading = true;
    this.loaded = false;
    this.rendered = false;
    this.emit("change", image);
  }

  onImageLoaded(image: ImageItem) {
    this.loadedImages.add(image);
    if (this.loadedImages.size === this.images.size) {
      this.loaded = true;
      this.loading = false;
      this.emit("change");
    } else {
      this.loading = true;
      this.loaded = false;
    }
  }

  onBlit(image: ImageItem) {
    for (const [, image] of this.images) {
      this.rendered = !image.rendered ? false : this.rendered;
    }
    if (this.rendered) {
      this.emit("change");
    }
  }

  clear() {
    for (const [_, image] of this.images) {
      // remove this bucket from the image
      image.removeBucket(this);
    }
    this.images.clear();
  }

  delete() {
    this.clear();
    this.master.removeBucket(this);
  }

  blit() {
    for (const [, image] of this.images) {
      image.blit();
    }
  }

  getRam() {
    let ram = 0;
    for (const [, image] of this.images) {
      ram += image.ram;
    }
    return ram;
  }

  getVideo() {
    let video = 0;
    for (const [, image] of this.images) {
      video += image.video;
    }
    return video;
  }

  getImages() {
    return Array.from(this.images.values());
  }

  onProgress(): void {
    let progress = 0;
    for (const [, image] of this.images) {
      progress += image.loadProgress;
    }
    this.loadProgress = progress / this.images.size;
    this.emit("change");
  }
}
