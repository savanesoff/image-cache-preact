import { ImageItem } from "./Image";
import { Loader } from "./loader";
import Logger from "./logger";

export class Network extends Logger {
  private processes = new Map<string, { image: ImageItem; loader: Loader }>();
  private imageQueue = new Map<string, ImageItem>();
  private maxProcesses = 16;
  loadedCount = 0;
  canceledCount = 0;
  erroredCount = 0;

  constructor(loaders?: number) {
    super({
      name: "Network",
      logLevel: "verbose",
    });
    this.maxProcesses = loaders ?? this.maxProcesses;
  }

  /**
   * Adds image to network queue. The image will be loaded when the network queue is processed
   */
  add(image: ImageItem) {
    if (image.loaded) return;
    // ensure we don't add the same image twice
    if (!this.imageQueue.has(image.url) && !this.processes.has(image.url)) {
      this.imageQueue.set(image.url, image);
    }
    // in case processing queue is empty, start processing
    this.update();
  }

  remove(image: ImageItem) {
    const queuedImage = this.imageQueue.get(image.url);
    if (queuedImage) {
      this.imageQueue.delete(image.url);
      this.update();
    }

    const process = this.processes.get(image.url);
    if (process) {
      process.loader.abort();
    }
  }

  private update() {
    if (this.processes.size >= this.maxProcesses) return;

    const entries = this.imageQueue.entries();
    for (const [url, image] of entries) {
      if (this.processes.size >= this.maxProcesses) return;
      this.processImage(image);
      this.imageQueue.delete(url);
    }
  }

  private processImage(image: ImageItem) {
    const loader = new Loader(image.url);
    const onDone = () => {
      loader.removeAllListeners();
      this.processes.delete(image.url);
      this.update();
    };

    loader.on("start", () => {
      image.onLoadStart();
    });

    loader.on("progress", () => {
      image.onLoaderProgress(loader);
    });

    loader.on("abort", () => {
      onDone();
    });

    loader.on("error", () => {
      this.erroredCount++;
      image.onLoadError();
      onDone();
    });

    loader.on("timeout", () => {
      this.erroredCount++;
      onDone();
    });

    loader.on("load", () => {
      this.loadedCount++;
      onDone();
      image.assignBlob(loader.blob);
      this.emit("load", image);
    });
    this.processes.set(image.url, { image, loader });
    loader.load();
  }
}
