import { Loader, Event as LoaderEvent, Events as LoaderEvents } from "@/loader";
import { Logger } from "@/logger";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

type Events = LoaderEvents | "pause" | "resume";

type NetworkProps = {
  /** Number of loaders in parallel */
  loaders?: number;
};

type NetworkEvent = {
  event: Events;
  target: Network;
};

type EventHandler = (event: NetworkEvent) => void;

const loaderEvent: LoaderEvents[] = [
  "loadstart",
  "progress",
  "abort",
  "error",
  "timeout",
  "loadend",
];
export class Network extends Logger {
  readonly inFlight = new Map<string, Loader>();
  readonly queue = new Map<string, Loader>();
  maxLoaders = 16;
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

  private onLoaderEvent({ event, target: loader }: LoaderEvent) {
    switch (event) {
      case "loadend":
      case "abort":
      case "timeout":
      case "error":
        loader.off(event, this.onLoaderEvent);
        this.inFlight.delete(loader.url);
        this.emit(event, loader);
        this.update();
        break;
      default:
        this.emit(event, loader);
    }
  }
  /**
   * Processes image
   */
  private launch(loader: Loader) {
    loaderEvent.forEach((event) => loader.on(event, this.onLoaderEvent));
    loader.load();
  }

  on(event: Events, handler: EventHandler): this {
    super.on(event, handler);
    return this;
  }

  emit(event: Events, loader?: Loader): boolean {
    return super.emit(event, {
      event,
      loader,
      target: this,
    });
  }
}
