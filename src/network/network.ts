import { Loader, LoaderEvent, LoaderEventTypes } from "@/loader";
import { Logger } from "@/logger";

export type NetworkEventTypes = LoaderEventTypes | "pause" | "resume";

type NetworkEvent<T extends NetworkEventTypes> = {
  event: T;
  target: Network;
};

export type NetworkEventHandler<T extends NetworkEventTypes> = (
  event: NetworkEvent<T>,
) => void;

const loaderEvent: LoaderEventTypes[] = [
  "loadstart",
  "progress",
  "abort",
  "error",
  "timeout",
  "loadend",
];

export type NetworkProps = {
  /** Number of loaders in parallel */
  loaders?: number;
};

export class Network extends Logger {
  readonly inFlight = new Map<string, Loader>();
  readonly queue = new Map<string, Loader>();
  maxLoaders = 6;
  paused = false;

  /**
   * Represents a network object.
   */
  constructor({ loaders }: NetworkProps = {}) {
    super({
      name: "Network",
      logLevel: "none",
    });
    this.maxLoaders = loaders ?? this.maxLoaders;
  }

  /**
   * Adds image to network queue. The image will be loaded when the network queue is processed
   */
  add(loader: Loader) {
    // ensure we don't add the same image twice
    if (!this.queue.has(loader.url) && !this.inFlight.has(loader.url)) {
      this.queue.set(loader.url, loader);
    }
    // in case processing queue is empty, start processing
    this.update();
  }

  /**
   * Removes image from network queue
   */
  remove(loader: Loader) {
    const queuedImage = this.queue.get(loader.url);
    if (queuedImage) {
      this.queue.delete(loader.url);
      this.update();
    }

    const inFlight = this.inFlight.get(loader.url);
    if (inFlight) {
      inFlight.abort();
    }
  }

  clear() {
    for (const loader of this.inFlight.values()) {
      loader.abort();
    }
    this.inFlight.clear();
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
    if (this.inFlight.size >= this.maxLoaders) return;

    const entries = this.queue.entries();
    for (const [url, loader] of entries) {
      if (this.inFlight.size >= this.maxLoaders) return;
      if (this.paused) {
        this.log.warn(["Network paused!"]);
        return;
      }
      this.inFlight.set(url, loader);
      this.queue.delete(url);
      this.launch(loader);
    }
  }

  private onLoaderEvent = ({
    type,
    target: loader,
  }: LoaderEvent<LoaderEventTypes>) => {
    switch (type) {
      case "loadend":
      case "abort":
      case "timeout":
      case "error":
        loader.off(type, this.onLoaderEvent);
        this.inFlight.delete(loader.url);
        this.emit(type, loader);
        this.update();
        break;
      default:
        this.emit(type, loader);
    }
  };
  /**
   * Processes image
   */
  private launch(loader: Loader) {
    loaderEvent.forEach((event) => loader.on(event, this.onLoaderEvent));
    loader.load();
  }

  on<T extends NetworkEventTypes>(
    type: T,
    handler: NetworkEventHandler<T>,
  ): this {
    super.on(type, handler);
    return this;
  }

  off<T extends NetworkEventTypes>(
    type: T,
    handler: NetworkEventHandler<T>,
  ): this {
    super.off(type, handler);
    return this;
  }

  emit<T extends NetworkEventTypes>(type: T, loader?: Loader): boolean {
    return super.emit(type, {
      type,
      loader,
      target: this,
    });
  }
}
