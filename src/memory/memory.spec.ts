import { Memory } from "./memory";

describe("Memory", () => {
  let memory: Memory;

  beforeEach(() => {
    memory = new Memory({ size: 1, units: "GB" });
  });

  afterEach(() => {
    memory.clear();
  });

  it("should add bytes to the memory object", () => {
    memory.add(100);
    expect(memory.getState()).toContain("Used: 10.000%");
    expect(memory.getState()).toContain("Count: 1");
  });

  it("should remove bytes from the memory object", () => {
    memory.add(100);
    memory.remove(50);
    expect(memory.getStatus()).toContain("Used: 5.000%");
    expect(memory.getStatus()).toContain("Count: 0");
  });

  it("should clear the memory object", () => {
    memory.add(100);
    memory.clear();
    expect(memory.getStatus()).toContain("Used: 0.000%");
    expect(memory.getStatus()).toContain("Count: 0");
  });

  it("should emit overflow event when memory is overflowed", () => {
    const overflowListener = vi.fn();
    memory.on("overflow", overflowListener);
    memory.add(2000);
    expect(overflowListener).toHaveBeenCalled();
  });

  it("should emit available event when memory is not overflowed", () => {
    const availableListener = vi.fn();
    memory.on("available", availableListener);
    memory.add(500);
    memory.remove(200);
    expect(availableListener).toHaveBeenCalled();
  });

  it("should emit clear event when memory is cleared", () => {
    const clearListener = vi.fn();
    memory.on("clear", clearListener);
    memory.clear();
    expect(clearListener).toHaveBeenCalled();
  });
});
