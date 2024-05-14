/**
 * The `FrameQueue` class provides a queue that processes RenderRequests,
 * by rendering each image separately.
 * It extends the `Logger` class, inheriting its logging capabilities.
 *
 * The `FrameQueue` class maintains a queue of `RenderRequest` instances,
 * each representing a request to render an image.
 * It also maintains a `hwRank` property, which represents the hardware rank number between 0 and 1,
 * where 1 is the fastest.
 *
 * The `FrameQueue` class provides an `add` method to add a `RenderRequest` to the queue.
 *
 * Usage:
 *
 * const frameQueue = new FrameQueue({
 *   name: "My Frame Queue",
 *   logLevel: "verbose",
 *   hwRank: 0.8,
 *   renderer: (props) => {
 *     console.log(`Rendering frame for request ${props.request.id} with render time ${props.renderTime}`);
 *   },
 * });
 * const renderRequest = new RenderRequest({ id: "request1", priority: 1 });
 * frameQueue.add(renderRequest); // Add a render request to the queue
 */
import { Logger, LoggerProps } from "@lib/logger";
import { RenderRequest } from "@lib/request";

export type FrameQueueEventTypes = "rendered" | "request-added" | "processed";
/** FrameQueue event */
export type FrameQueueEvent<T extends FrameQueueEventTypes> = {
  /** The type of the event */
  type: T;
  /** The target of the event */
  target: FrameQueue;
} & (T extends "request-added" ? { request: RenderRequest } : unknown);
/** FrameQueue event handler */
export type FrameQueueEventHandler<T extends FrameQueueEventTypes> = (
  event: FrameQueueEvent<T>,
) => void;

export type RendererProps = {
  /** The render request to process */
  request: RenderRequest;
  /** The estimated render time for the request depending on the image size and HW rank */
  renderTime: number;
};

/** Render function */
export type RenderFunction = (props: RendererProps) => void;

/** FrameQueue properties */
export type FrameQueueProps = LoggerProps & {
  /** The hardware rank number between 0 and 1, where 1 is the fastest */
  hwRank?: number;
  /** The renderer function to process the render request */
  renderer?: RenderFunction;
};

/**
 * FrameQueue is a queue that processes callbacks in the next animation frame.
 */
export class FrameQueue extends Logger {
  /** Flag to indicate if the queue is scheduled */
  private scheduled = false;
  /** Hardware rank number between 0 and 1, where 1 is the fastest */
  readonly hwRank: number;
  /** Set of render requests */
  readonly queue = new Set<RenderRequest>();
  /**
   * The number of bytes per frame ratio estimate. This value determines how fast a platform
   * can render a frame based on the number of bytes in the image.
   * Where bytes refers to the uncompressed image size.
   * The value is set to 50000 bytes per frame, which is an estimate for a typical platform,
   * and can be adjusted based on the platform's performance.
   * Typical platforms can render 50000 bytes per frame at 60fps.
   */
  static readonly bytesPerFrameRatio = 50000;
  /** The renderer function to process the render request */
  readonly renderer: RenderFunction;

  constructor({
    name = "Frame queue",
    logLevel = "verbose",
    hwRank = 1,
    renderer,
  }: FrameQueueProps) {
    super({
      name,
      logLevel,
    });
    this.hwRank = hwRank;
    this.renderer = renderer || this.#renderer;
  }

  /**
   * Adds a render request to the queue.
   * @param request
   */
  add(request: RenderRequest) {
    this.queue.add(request);
    this.emit("request-added", { request });
    this.log.info([`added: ${this.queue.size}`]);
    this.#next();
  }

  //------------------------   PRIVATE METHODS   -------------------------------

  /**
   * Gets the render time for a request based on the image size and hardware rank.
   * @param request
   */
  #getRenderTime(request: RenderRequest) {
    return (
      (request.image.bytesUncompressed / FrameQueue.bytesPerFrameRatio) *
      (1 - this.hwRank)
    );
  }

  /**
   * Processes the next render request in the queue.
   * Waits for the current request to be processed before processing the next one.
   */
  #next() {
    if (this.scheduled) return;
    this.scheduled = true;
    // get the request in the order they were added
    const request = this.queue.values().next().value as
      | RenderRequest
      | undefined;
    if (!request) {
      this.scheduled = false;
      return;
    }
    if (request.image.gpuDataFull && request.image.decoded) {
      this.scheduled = false;
      this.queue.delete(request);
      request.onProcessing();
      request.onRendered();
      setTimeout(() => this.#next(), 0);
      return;
    }
    this.log.info([`processing: ${this.queue.size}`]);
    const renderTime = this.#getRenderTime(request);
    request.onProcessing();
    this.renderer({ request, renderTime });
    this.queue.delete(request);

    setTimeout(() => {
      this.scheduled = false;
      request.onRendered();
      this.#next();
      this.log.verbose([
        `processed`,
        request,
        `queue size: ${this.queue.size}`,
      ]);
    }, renderTime);
  }

  /**
   * The default renderer function.
   * @param props
   */
  #renderer({ request, renderTime }: RendererProps) {
    // create div of w/h set opacity to 0.1 append to body, ren remove on next frame
    const div = document.createElement("div");
    const style = {
      width: `${request.size.width}px`,
      height: `${request.size.height}px`,
      opacity: "0.01",
      position: "absolute",
      top: "0",
      left:
        Math.round(Math.random() * (window.innerWidth - request.size.width)) +
        "px",
      backgroundImage: `url(${request.image.url})`,
      // backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "top left",
      backgroundSize: `${request.size.width}px ${request.size.height}px`,
    };
    Object.assign(div.style, style);
    document.body.appendChild(div);

    setTimeout(() => {
      document.body.removeChild(div);
    }, renderTime);
  }

  //------------------------   EVENT EMITTER METHODS   -------------------------

  /**
   * Adds an event listener for the specified event type.
   * @param type - The type of the event to listen for.
   * @param handler - The event handler function.
   * @returns The current instance of the FrameQueue class.
   */
  on<T extends FrameQueueEventTypes>(
    type: T,
    handler: FrameQueueEventHandler<T>,
  ): this {
    return super.on(type, handler);
  }

  /**
   * Removes an event listener for the specified event type.
   * @param type - The type of the event to remove the listener for.
   * @param handler - The event handler function to remove.
   * @returns The current instance of the FrameQueue class.
   */
  off<T extends FrameQueueEventTypes>(
    type: T,
    handler: FrameQueueEventHandler<T>,
  ): this {
    return super.off(type, handler);
  }

  /**
   * Emits an event of the specified type with the specified data.
   * @param type - The type of the event to emit.
   * @param data - The data to emit with the event.
   * @returns True if the event was emitted successfully, false otherwise.
   */
  emit<T extends FrameQueueEventTypes>(
    type: T,
    data?: Omit<FrameQueueEvent<T>, "target" | "type">,
  ): boolean {
    return super.emit(type, { ...data, type, target: this });
  }
}
