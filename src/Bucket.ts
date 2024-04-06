import { Img } from "@/image";
import defaultImageURL from "./assets/default.png";
import { Logger } from "@/logger";
import { Master } from "./master";

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "numeric",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hourCycle: "h23",
};
export interface BucketProps {
  name: string;
  locked?: boolean;
  blit?: boolean;
  load?: boolean;
  master: Master;
  urls?: string[];
  defaultURL?: string;
}

type BucketConfig = {
  locked: boolean;
  blit: boolean;
  load: boolean;
};

export class Bucket extends Logger {
  private readonly master: Master;
  readonly config: BucketConfig;
  readonly images = new Map<string, Img>();
  readonly bucket: Bucket;

  defaultURL: string;
  rendered = false;
  loading = false;
  loaded = false;
  loadProgress = 0;
  timeout = 0;

  constructor({
    name,
    master,
    urls = [],
    defaultURL = defaultImageURL,
    load = true,
    blit = true,
    locked = false,
  }: BucketProps) {
    super({
      name: `Bucket:${name}`,
      logLevel: "verbose",
    });
    this.bucket = this;
    this.master = master;
    this.config = { locked, blit, load };
    this.defaultURL = defaultURL;
    // register bucket with master
    this.master.addBucket(this);

    this.on("loadstart", this.onStartLoading);
    this.on("progress", this.onLoadProgress);
    this.on("loaded", this.onLoaded);
    this.on("blit", this.onBlit);

    // add images to bucket if provided
    urls.forEach((url) => this.addImage(url));
  }

  clearSize({ size, image }: { size: string; image: Img }) {
    this.log.info(["clearSize", size, image]);
  }

  addSize({ size, image }: { size: string; image: Img }) {
    this.log.info(["addSize", size, image]);
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

  /**
   * Load all images in this bucket.
   * This is an explicit call to load images in case the bucket config is set to not load images on creation.
   */
  load() {
    if (this.loaded || this.loading) return;
    for (const [, image] of this.images) {
      this.master.requestLoad(image);
    }

    this.emit("change");
  }

  private onStartLoading = (image: Img) => {
    this.loading = true;
    this.loaded = false;
    this.rendered = false;
    this.emit("change", image);
  };

  private onLoadProgress = (): void => {
    let progress = 0;
    for (const [, image] of this.images) {
      progress += image.loadProgress;
    }
    this.loadProgress = progress / this.images.size;
    this.emit("change");
  };

  private onLoaded = (image: Img) => {
    if (this.config.blit) {
      image.blit();
    }

    for (const [, image] of this.images) {
      if (!image.loaded) return;
    }
    this.loaded = true;
    this.loading = false;
    this.loadProgress = 1;
    this.emit("change");
    this.log.info([
      `Loaded ${this.name}`,
      new Date().toLocaleTimeString("en-US", TIME_FORMAT),
    ]);
  };

  private onBlit = () => {
    let blit = true;
    for (const [, image] of this.images) {
      blit = !image.rendered ? false : blit;
    }
    if (this.rendered !== blit) {
      this.rendered = blit;
      this.emit("change");
      this.log.info([
        `Blit ${this.name}`,
        new Date().toLocaleTimeString("en-US", TIME_FORMAT),
      ]);
    } else {
      this.rendered = blit;
    }
  };

  clear = () => {
    for (const [, image] of this.images) {
      // remove this bucket from the image
      image.removeBucket(this);
    }
    this.master.removeBucket(this);
    this.removeAllListeners();
  };

  blit() {
    for (const [, image] of this.images) {
      image.blit();
    }
  }

  unBlit() {
    for (const [, image] of this.images) {
      image.unblit();
    }
  }

  getRam() {
    let ram = 0;
    for (const [, image] of this.images) {
      ram += image.bytes;
    }
    return ram;
  }

  getVideo() {
    let video = 0;
    for (const [, image] of this.images) {
      video += image.sizeRender.width * image.sizeRender.height * 4;
    }
    return video;
  }

  getImages() {
    return Array.from(this.images.values());
  }
}
