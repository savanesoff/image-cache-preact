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
  RAM: 100, // in MB
  VIDEO: 10000, // in MB
  LOADERS: 8, // parallel loaders
  COMPRESSION_RATIO: 0.18, // 50% compression
  UNITS: "MB", // 1MB
};

type LogLevel = "none" | "verbose" | "info" | "warn" | "error";

const state = {
  memory: {
    ram: 0,
    video: 0,
  },
  updating: false,
  cache: new Map<string, ImageItem>(),
  buckets: new Set<Bucket>(),
  logLevel: "none" as LogLevel,
};

export const Master = Object.freeze({
  log(data: (string | number | boolean)[], styles = "color: white;") {
    state.logLevel === "verbose" &&
      console.log(
        ["%cMaster:", ...data.map((v) => `\t${v}`)].join("\n"),
        styles
      );
  },

  info(data: (string | number | boolean)[], styles = "") {
    ["info", "verbose"].includes(state.logLevel) &&
      console.info(
        ["%cMaster:", ...data.map((v) => `\t${v}`)].join("\n"),
        styles
      );
  },

  warn(data: (string | number | boolean)[]) {
    ["warn", "info", "verbose"].includes(state.logLevel) &&
      console.warn("Master:", ...data.map((v) => `\n\t${v}`));
  },

  error(data: (string | number | boolean)[]) {
    ["error", "warn", "info", "verbose"].includes(state.logLevel) &&
      console.error("Master:", ...data.map((v) => `\n\t${v}`));
  },

  logRam() {
    this.info(
      [
        "RAM: " + state.memory.ram.toFixed(1) + CONFIG.UNITS,
        "-used: " + state.memory.ram.toFixed(1) + CONFIG.UNITS,
        "-configured: " + CONFIG.RAM.toFixed(1) + CONFIG.UNITS,
        "-remained: " +
          (CONFIG.RAM - state.memory.ram).toFixed(1) +
          CONFIG.UNITS,
      ],
      "color: skyblue;"
    );
  },

  logVideo() {
    this.info(
      [
        `VIDEO: ${state.memory.video.toFixed(1)} ${CONFIG.UNITS}`,
        `-used: ${state.memory.video.toFixed(1)} ${CONFIG.UNITS}`,
        `-configured: ${CONFIG.VIDEO.toFixed(1)} ${CONFIG.UNITS}`,
        `-remained: ${(CONFIG.VIDEO - state.memory.video).toFixed(1)} ${
          CONFIG.UNITS
        }`,
      ],
      "color: orange; "
    );
  },

  setLog(level: LogLevel) {
    state.logLevel = level;
  },

  get(url: string) {
    const cached = state.cache.get(url);
    const image = cached || new ImageItem(url);
    if (!cached) state.cache.set(url, image);
    return image;
  },

  configure(config: CacheConfig) {
    Object.assign(CONFIG, config);
  },

  getConfig(): CacheConfig {
    return { ...CONFIG };
  },

  addBucket(bucket: Bucket) {
    state.buckets.add(bucket);
  },

  removeBucket(bucket: Bucket) {
    state.buckets.delete(bucket);
  },

  onLoaded(image: ImageItem) {
    state.memory.ram += image.ram;
    this.info([`Image loaded: ${image.ram.toFixed(1)} ${CONFIG.UNITS}`]);
    this.logRam();
    this.update();
  },

  onBlit(image: ImageItem) {
    state.memory.video += image.video;
    this.info([`Image Blit: ${image.video.toFixed(1)} ${CONFIG.UNITS}`]);
    this.logVideo();
    this.update();
  },

  onDelete(image: ImageItem) {
    state.memory.ram -= image.ram;
    state.memory.video -= image.video;
    state.cache.delete(image.URL);
    this.update();
  },

  onUnblit(image: ImageItem) {
    state.memory.video -= image.video;
    console.log("unblit", image.video, state.memory.video);
    this.update();
  },

  shouldUpdate() {
    // console.log(state.memory.ram, state.memory.video);
    return state.memory.ram > CONFIG.RAM || state.memory.video > CONFIG.VIDEO;
  },

  update() {
    if (state.updating || !this.shouldUpdate()) return;
    this.info(
      [
        "updating...",
        `RAM: ${state.memory.ram.toFixed(1)} ${CONFIG.UNITS}`,
        `VIDEO: ${state.memory.video.toFixed(1)} ${CONFIG.UNITS}`,
      ],
      "color: red;"
    );
    state.updating = true;
    // delete images
    const entries = state.cache.entries();
    let [, image]: [string, ImageItem] = entries.next().value;
    while (image && this.shouldUpdate()) {
      if (state.memory.ram > CONFIG.RAM) {
        // this will delete the image from cache which means video will be freed as well
        image.delete();
      } else if (state.memory.video > CONFIG.VIDEO) {
        image.unblit();
      }
      [, image] = entries.next().value ?? [];
    }
    state.updating = false;
    this.info(
      [
        "updated:",
        `RAM: ${state.memory.ram.toFixed(1)} ${CONFIG.UNITS}`,
        `VIDEO: ${state.memory.video.toFixed(1)} ${CONFIG.UNITS}`,
      ],
      "color: lime;"
    );

    if (this.shouldUpdate()) {
      throw "Unable to free memory. Please increase the cache size or reduce the number of images.";
    }
  },
});
