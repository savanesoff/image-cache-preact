import { ImageItem } from "./Image";
import { Bucket } from "./Bucket";

export const UNITS = {
  BITE: 1,
  BYTE: 4,
  KB: 1000,
  MB: 1000000,
  GB: 1000000000,
  TB: 1000000000000,
};
type CacheConfig = {
  RAM: number;
  VIDEO: number;
  LOADERS: number;
  COMPRESSION_RATIO: number;
  UNITS: keyof typeof UNITS;
};

const CONFIG: CacheConfig = {
  RAM: 10000, // in MB
  VIDEO: 10000, // in MB
  LOADERS: 8, // parallel loaders
  COMPRESSION_RATIO: 0.18, // 50% compression
  UNITS: "MB", // 1MB
};

const cache = new Map<string, ImageItem>();
const buckets = new Set<Bucket>();
const memory = {
  ram: 0,
  video: 0,
};
export const Master = {
  updating: false,
  get(url: string) {
    const cached = cache.get(url);
    const image = cached || new ImageItem(url);
    if (!cached) cache.set(url, image);
    return image;
  },

  configure(config: CacheConfig) {
    Object.assign(CONFIG, config);
  },

  getConfig(): CacheConfig {
    return { ...CONFIG };
  },

  addBucket(bucket: Bucket) {
    buckets.add(bucket);
  },

  removeBucket(bucket: Bucket) {
    buckets.delete(bucket);
  },

  onLoaded(image: ImageItem) {
    memory.ram += image.ram;
    console.log(
      "image ram: " + image.ram.toFixed(1) + CONFIG.UNITS,
      "used ram: " + memory.ram.toFixed(1) + CONFIG.UNITS,
      "configured ram: " + CONFIG.RAM.toFixed(1) + CONFIG.UNITS,
      "remained ram: " + (CONFIG.RAM - memory.ram).toFixed(1) + CONFIG.UNITS
    );

    this.update();
  },

  onBlit(image: ImageItem) {
    memory.video += image.video;
    console.log(
      "image video: " + image.video.toFixed(1) + CONFIG.UNITS,
      "used video: " + memory.video.toFixed(1) + CONFIG.UNITS,
      "configured video: " + CONFIG.VIDEO.toFixed(1) + CONFIG.UNITS,
      "remained video: " +
        (CONFIG.VIDEO - memory.video).toFixed(1) +
        CONFIG.UNITS
    );
    this.update();
  },

  onDelete(image: ImageItem) {
    memory.ram -= image.ram;
    memory.video -= image.video;
    cache.delete(image.URL);
    this.update();
  },

  onUnblit(image: ImageItem) {
    memory.video -= image.video;
    console.log("unblit", image.video, memory.video);
    this.update();
  },

  shouldUpdate() {
    // console.log(memory.ram, memory.video);
    return memory.ram > CONFIG.RAM || memory.video > CONFIG.VIDEO;
  },

  update() {
    if (this.updating || !this.shouldUpdate()) return;
    this.updating = true;
    // delete images
    const entries = cache.entries();
    let [_, image]: [string, ImageItem] = entries.next().value;
    while (image && this.shouldUpdate()) {
      if (memory.ram > CONFIG.RAM) {
        // this will delete the image from cache which means video will be freed as well
        image.delete();
      } else if (memory.video > CONFIG.VIDEO) {
        image.unblit();
      }
      [_, image] = entries.next().value ?? [];
    }
    this.updating = false;
    console.log(
      "update finished: \n\tRAM",
      memory.ram + CONFIG.UNITS,
      "\tVIDEO",
      memory.video + CONFIG.UNITS
    );

    if (this.shouldUpdate()) {
      throw "Unable to free memory. Please increase the cache size or reduce the number of images.";
    }
  },
};
