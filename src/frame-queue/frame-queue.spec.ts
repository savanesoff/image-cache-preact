import { FrameQueue } from "./frame-queue";

describe("FrameQueue", () => {
  let blitQueue: FrameQueue;

  beforeEach(() => {
    blitQueue = new FrameQueue();
  });

  it("should add callbacks to the queue", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    blitQueue.add(cb1);
    blitQueue.add(cb2);

    expect(blitQueue["queue"]).toHaveLength(2);
    expect(blitQueue["queue"][0]).toBe(cb1);
    expect(blitQueue["queue"][1]).toBe(cb2);
  });

  it("should process the queue in the correct order", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    blitQueue.add(cb1);
    blitQueue.add(cb2);

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(0);

    // Simulate requestAnimationFrame callback
    vi.runAllTimers();

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });
});
