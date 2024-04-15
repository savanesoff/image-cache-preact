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
import { RenderRequest, Logger, LoggerProps } from "@lib";

export type FrameQueueEventTypes = "rendered";
/** FrameQueue event */
export type FrameQueueEvent<T extends FrameQueueEventTypes> = {
  /** The type of the event */
  type: T;
  /** The target of the event */
  target: FrameQueue;
};
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
  private scheduled = false;
  readonly hwRank: number; // hardware rank number between 0 and 1, where 1 is the fastest
  readonly queue = new Set<RenderRequest>();
  /** The number of bytes per frame ratio estimate */
  static readonly bytesPerFrameRatio = 50000;
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
    this.#next();
    this.log.verbose(["added to queue"]);
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
   * If there are no requests in the queue, it sets the scheduled flag to false.
   * If there are requests in the queue, it processes the next request.
   * If the request is processed, it sets the scheduled flag to false and emits a "processed" event.
   * If the request is processed, it calls the onRendered method of the request.
   * If the request is processed, it calls the next method to process the next request.
   * If the request is processed, it logs the processed request and the queue size.
   */
  #next() {
    if (this.scheduled) return;
    this.scheduled = true;
    const request = this.queue.values().next().value;
    if (!request) {
      this.scheduled = false;
      return;
    }
    this.log.info([`processing: ${this.queue.size}`]);
    const renderTime = this.#getRenderTime(request);
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
      opacity: "0.001",
      position: "absolute",
      top: "0",
      left:
        Math.round(Math.random() * (window.innerWidth - request.size.width)) +
        "px",
      backgroundImage: `url(${request.image.url})`,
      backgroundSize: "cover",
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
    data: FrameQueueEvent<T>["target"],
  ): boolean {
    return super.emit(type, data);
  }
}
