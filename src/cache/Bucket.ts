import { ImageItem } from "./Image";
import { Master } from "./master";
import { EventEmitter } from "events";

export type BucketConfig = {
  locked: boolean;
  blit: boolean;
  load: boolean;
};

export class Bucket extends EventEmitter {
  readonly config: BucketConfig;
  readonly images = new Map<string, ImageItem>();
  loadedImages = new Set<ImageItem>();
  blitImages = new Set<ImageItem>();
  rendered = false;
  loading = false;
  loaded = false;

  constructor(config: BucketConfig, urls: string[] = []) {
    super();
    this.config = { ...{ locked: false, blit: true, load: true }, ...config };
    urls.forEach((url) => this.add(url));
    Master.addBucket(this);
  }

  unlock() {
    this.config.locked = false;
  }

  lock() {
    this.config.locked = true;
  }

  load() {
    if (this.loaded || this.loading) return;
    for (const [_, image] of this.images) {
      image.load();
    }

    this.emit("change");
  }

  onLoading(image: ImageItem) {
    this.loading = true;
    this.loaded = false;
    this.emit("change", image);
  }

  onLoaded(image: ImageItem) {
    this.loadedImages.add(image);
    if (this.loadedImages.size === this.images.size) {
      this.loaded = true;
      this.loading = false;
      this.emit("change");
    }
  }

  onBlit(image: ImageItem) {
    this.blitImages.add(image);
    if (this.blitImages.size === this.images.size) {
      this.rendered = true;
      this.emit("change");
    }
  }

  clear() {
    for (const [url] of this.images) {
      // remove this bucket from the image
      Master.get(url)?.removeBucket(this);
    }
    this.images.clear();
  }

  add(url: string) {
    const image = Master.get(url);
    image.addBucket(this);
    this.images.set(url, image);
  }

  remove(url: string) {
    const image = this.images.get(url);
    if (image) {
      image.removeBucket(this);
      this.images.delete(url);
    }
  }

  delete() {
    this.clear();
    Master.removeBucket(this);
  }

  blit() {
    for (const [_, image] of this.images) {
      image.blit();
    }
  }

  getRam() {
    let ram = 0;
    for (const [_, image] of this.images) {
      ram += image.ram;
    }
    return ram;
  }

  getVideo() {
    let video = 0;
    for (const [_, image] of this.images) {
      video += image.video;
    }
    return video;
  }
}
