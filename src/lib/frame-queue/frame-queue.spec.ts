import { FrameQueue } from "./frame-queue";
vi.useFakeTimers();
describe("FrameQueue", () => {
  let blitQueue: FrameQueue;

  beforeEach(() => {
    blitQueue = new FrameQueue();
  });

  it("should be defined", () => {
    expect(blitQueue).toBeDefined();
  });

  it("should not have first cb in queue", () => {
    blitQueue.add(vi.fn());
    expect(blitQueue.queue).toHaveLength(0);
  });
  it("should process first callback immediately", () => {
    const cb1 = vi.fn();
    blitQueue.add(cb1);
    expect(cb1).toHaveBeenCalledTimes(1);
  });
  it("should add next callbacks to the queue", () => {
    blitQueue.add(vi.fn());
    blitQueue.add(vi.fn());
    expect(blitQueue.queue).toHaveLength(1);
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

  it("should clear queue after processing", () => {
    blitQueue.add(vi.fn());
    blitQueue.add(vi.fn());
    vi.runAllTimers();

    expect(blitQueue.queue).toHaveLength(0);
  });
});
