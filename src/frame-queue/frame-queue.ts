import { Logger } from "@/logger";

type CB = () => void;

/**
 * FrameQueue is a queue that processes callbacks in the next animation frame.
 */
export class FrameQueue extends Logger {
  private scheduled = false;
  readonly queue = new Set<CB>();
  constructor() {
    super({
      name: "BlitQueue",
      logLevel: "none",
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
    try {
      cb();
      this.queue.delete(cb);
    } catch (e) {
      this.log.error([`Error processing callback: ${e}`]);
    }

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
