import { Bucket } from "./Bucket";
import { ImageItem } from "./Image";
import Logger, { LogLevel } from "./logger";
import { default as Memory } from "./memory";
import { Network } from "./network";
import { UnitsType } from "./units";

interface CacheConfig {
  ram?: number;
  video?: number;
  loaders?: number;
  units?: UnitsType;
  logLevel?: LogLevel;
}

export class Master extends Logger {
  private ram: Memory;
  private video: Memory;
  private updating = false;
  private cache = new Map<string, ImageItem>();
  private buckets = new Set<Bucket>();
  readonly network: Network;

  constructor({
    ram = 1,
    video = 2,
    loaders = 3,
    units = "GB",
    logLevel = "verbose",
  }: CacheConfig = {}) {
    super({
      name: "Master",
      logLevel,
      styles: {
        info: "color: green;",
        warn: "color: orange;",
        error: "color: red;",
        log: "color: skyblue;",
      },
    });
    this.network = new Network(loaders);

    this.ram = new Memory({
      size: ram,
      units: units,
      logLevel,
      name: "RAM",
    });
    this.ram.on("overflow", this.update);

    this.video = new Memory({
      size: video,
      units: units,
      logLevel,
      name: "VIDEO",
    });
    this.video.on("overflow", this.update);
  }

  getImage(url: string): ImageItem {
    return this.cache.get(url) || this.createImage(url);
  }

  requestLoad(image: ImageItem) {
    this.network.add(image);
  }

  private createImage(url: string): ImageItem {
    const image = new ImageItem(url);
    this.cache.set(url, image);
    image.on("loaded", this.onLoaded);
    image.on("blit", this.onBlit);
    image.on("unblit", this.onUnblit);
    image.on("clear", this.onClear);
    return image;
  }

  private onLoaded = (image: ImageItem) => {
    this.ram.add(image.bytes);
  };

  private onClear = (image: ImageItem) => {
    this.ram.remove(image.bytes);
    image.removeAllListeners();
  };

  private onBlit = (image: ImageItem) => {
    this.video.add(image.width * image.height * 4);
  };

  private onUnblit = (image: ImageItem) => {
    this.video.remove(image.width * image.height * 4);
  };

  private delete(url: string) {
    const image = this.cache.get(url);
    if (!image || !image.canClear()) return;
    this.network.remove(image);
    image.clear();
    this.cache.delete(url);
  }

  addBucket(bucket: Bucket) {
    this.buckets.add(bucket);
  }

  removeBucket(bucket: Bucket) {
    this.buckets.delete(bucket);
  }

  private inOverflow(): boolean {
    return this.ram.isOverflow() || this.video.isOverflow();
  }

  private update = () => {
    if (this.updating || !this.inOverflow()) return;

    this.updating = true;

    this.log.info(
      [
        "updating...",
        `RAM: ${this.ram.getStatus()}`,
        `VIDEO: ${this.video.getStatus()}`,
      ],
      "color: red;"
    );
    // delete images
    const entries = this.cache.entries();

    for (const [, image] of entries) {
      if (this.ram.isOverflow()) {
        // this will delete the image from cache which means video will be freed as well
        this.delete(image.url);
      } else if (this.video.isOverflow()) {
        image.unblit();
      }
    }

    this.updating = false;
    this.log.info(
      [
        "updated:",
        `RAM: ${this.ram.getStatus()}`,
        `VIDEO: ${this.video.getStatus()}`,
      ],
      "color: lime;"
    );

    if (this.inOverflow()) {
      throw "Unable to free memory. Please increase the cache size or reduce the number of images or unlock your buckets.";
    }
  };
}
