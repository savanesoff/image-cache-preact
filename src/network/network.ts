import { Loader, Resource } from "@/loader";
import { Logger } from "@/logger";

type events =
  | "loadstart"
  | "progress"
  | "loadend"
  | "abort"
  | "timeout"
  | "error"
  | "check-memory"
  | "pause"
  | "resume";

export class Network extends Logger {
  readonly loaders = new Map<string, Loader>();
  readonly queue = new Map<string, Resource>();
  maxLoaders = 16;
  paused = false;

  /**
   * Represents a network object.
   */
  constructor(loaders?: number) {
    super({
      name: "Network",
      logLevel: "none",
    });
    this.maxLoaders = loaders ?? this.maxLoaders;
  }

  /**
   * Adds image to network queue. The image will be loaded when the network queue is processed
   */
  add(resource: Resource) {
    // ensure we don't add the same image twice
    if (!this.queue.has(resource.url) && !this.loaders.has(resource.url)) {
      this.queue.set(resource.url, resource);
    }
    // in case processing queue is empty, start processing
    this.update();
  }

  /**
   * Removes image from network queue
   */
  remove(resource: Resource) {
    const queuedImage = this.queue.get(resource.url);
    if (queuedImage) {
      this.queue.delete(resource.url);
      this.update();
    }

    const loader = this.loaders.get(resource.url);
    if (loader) {
      loader.abort();
    }
  }

  clear() {
    for (const loader of this.loaders.values()) {
      loader.abort();
    }
    this.loaders.clear();
    this.queue.clear();
  }

  pause() {
    this.paused = true;
    this.emit("pause");
  }

  resume() {
    this.paused = false;
    this.emit("resume");
    this.update();
  }

  /**
   * Cancels all network requests
   */
  private update() {
    if (this.loaders.size >= this.maxLoaders) return;

    const entries = this.queue.entries();
    for (const [url, resource] of entries) {
      if (this.loaders.size >= this.maxLoaders) return;
      if (this.paused) {
        this.log.warn(["Network paused!"]);
        return;
      }
      this.processResource(resource);
      this.queue.delete(url);
    }
  }

  /**
   * Processes image
   */
  private processResource(resource: Resource) {
    const loader = new Loader(resource);
    const onDone = () => {
      loader.removeAllListeners();
      this.loaders.delete(resource.url);
      this.update();
    };

    loader.on("loadstart", () => {
      this.emit("loadstart", loader);
    });

    loader.on("progress", () => {
      this.emit("progress", loader);
    });

    loader.on("abort", () => {
      this.emit("abort", loader);
      onDone();
    });

    loader.on("error", () => {
      this.emit("error", loader);
      onDone();
    });

    loader.on("timeout", () => {
      this.emit("timeout", loader);
      onDone();
    });

    loader.on("loadend", () => {
      this.emit("loadend", loader);
      onDone();
      // image.assignBlob(loader.blob);
      // this.emit("load", image);
    });
    this.loaders.set(resource.url, loader);
    loader.load();
  }

  on(event: events, listener: () => void): this {
    super.on(event, listener);
    return this;
  }

  emit(event: events, loader?: Loader): boolean {
    return super.emit(event, this, loader);
  }
}
