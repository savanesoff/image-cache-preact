import { Logger, LoggerProps } from "@/logger";

type CB = () => void;

export type FrameQueueProps = LoggerProps;
/**
 * FrameQueue is a queue that processes callbacks in the next animation frame.
 */
export class FrameQueue extends Logger {
  private scheduled = false;
  readonly queue = new Set<CB>();
  constructor({ name = "Frame queue", logLevel = "verbose" }: FrameQueueProps) {
    super({
      name,
      logLevel,
    });
  }

  private processQueue() {
    if (this.scheduled) return;
    this.scheduled = true;
    const cb = this.queue.values().next().value;
    if (!cb) {
      this.scheduled = false;
      return;
    }
    this.log.verbose([`processing: ${this.queue.size}`]);
    cb();
    this.queue.delete(cb);

    window.requestAnimationFrame(() => {
      this.scheduled = false;
      this.processQueue();
      this.log.verbose([`processed`]);
    });
  }

  add(cb: CB) {
    this.queue.add(cb);
    this.processQueue();
    this.log.verbose(["added to queue"]);
  }
}
