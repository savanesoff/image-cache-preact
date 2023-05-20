import { Bucket } from "./Bucket";
import { CacheImage } from "./CacheImage";
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
  private cache = new Map<string, CacheImage>();
  private buckets = new Set<Bucket>();
  readonly network: Network;

  constructor({
    ram = 2,
    video = 1,
    loaders = 6,
    units = "GB",
    logLevel = "error",
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
    this.network.on("check-memory", this.onSetRamStatus);
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
      logLevel: "verbose",
      name: "VIDEO",
    });
    this.video.on("overflow", this.update);
  }

  getImage(url: string): CacheImage {
    return this.cache.get(url) || this.createImage(url);
  }

  requestLoad(image: CacheImage) {
    this.network.add(image);
  }

  private onSetRamStatus = (memory: { overflow: boolean }) => {
    memory.overflow = this.ram.isOverflow();
  };

  private createImage(url: string): CacheImage {
    const image = new CacheImage(url);
    this.cache.set(url, image);
    image.on("loaded", this.onLoaded);
    image.on("blit", this.onBlit);
    image.on("unblit", this.onUnblit);
    image.on("clear", this.onClear);
    return image;
  }

  private onLoaded = (image: CacheImage) => {
    this.ram.add(image.bytes);
  };

  private onClear = (image: CacheImage) => {
    this.ram.remove(image.bytes);
    image.removeAllListeners();
  };

  private onBlit = (image: CacheImage) => {
    this.video.add(image.sizeRender.width * image.sizeRender.height * 4);
  };

  private onUnblit = (image: CacheImage) => {
    this.video.remove(image.sizeRender.width * image.sizeRender.height * 4);
  };

  private delete(url: string) {
    const image = this.cache.get(url);
    if (!image || image.isLocked()) return;
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
      } else if (this.video.isOverflow() && !image.isLocked()) {
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
