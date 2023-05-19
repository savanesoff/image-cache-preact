import Logger from "./logger";

type BlitCB = () => void;

export default class BlitQueue extends Logger {
  private scheduled = false;
  private readonly queue: BlitCB[] = [];
  constructor() {
    super({
      name: "BlitQueue",
      logLevel: "verbose",
    });
  }

  private processQueue() {
    if (this.scheduled) return;
    this.scheduled = true;
    const cb = this.queue.shift();
    if (!cb) {
      this.scheduled = false;
      return;
    }

    window.requestAnimationFrame(() => {
      cb();
      this.scheduled = false;
      this.processQueue();
    });
  }

  add(cb: BlitCB) {
    this.queue.push(cb);
    this.processQueue();
    this.log.verbose(["added to queue"]);
  }
}
