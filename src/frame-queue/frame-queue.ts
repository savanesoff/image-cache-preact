import { RenderRequest } from "@/image/render-request";
import { Logger, LoggerProps } from "@/logger";

export type RendererProps = {
  request: RenderRequest;
  renderTime: number;
};

export type RenderFunction = (props: RendererProps) => void;
export type FrameQueueProps = LoggerProps & {
  hwRank?: number;
  renderer?: RenderFunction;
};

/**
 * FrameQueue is a queue that processes callbacks in the next animation frame.
 */
export class FrameQueue extends Logger {
  private scheduled = false;
  readonly hwRank: number; // hardware rank number between 0 and 1, where 1 is the fastest
  readonly queue = new Set<RenderRequest>();
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

  add(request: RenderRequest) {
    this.queue.add(request);
    this.#next();
    this.log.verbose(["added to queue"]);
  }

  #getRenderTime(request: RenderRequest) {
    return (
      (request.image.bytesUncompressed / FrameQueue.bytesPerFrameRatio) *
      (1 - this.hwRank)
    );
  }

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

  //default render function
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
      backgroundSize: "cover",
    };
    Object.assign(div.style, style);
    document.body.appendChild(div);

    setTimeout(() => {
      document.body.removeChild(div);
    }, renderTime);
  }
}
