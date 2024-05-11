import { FrameQueue } from "../frame-queue";
import { Memory } from "../memory";
import { Network } from "../network";
import { Controller } from "./controller";

vi.mock("@lib/memory");
vi.mock("@lib/memory");
vi.mock("@lib/network");
vi.mock("@lib/frame-queue");
vi.mock("@lib/image");

describe("Controller", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("constructor", () => {
    it("should create instance", () => {
      const controller = new Controller({});
      expect(controller).toBeDefined();
    });
    it("should have default units GB", () => {
      const controller = new Controller({});
      expect(controller.units).toBe("GB");
    });
    it('should have default log level "error"', () => {
      const controller = new Controller({});
      expect(controller.level).toBe("error");
    });
    it("should have default gpuDataFull false", () => {
      const controller = new Controller({});
      expect(controller.gpuDataFull).toBe(false);
    });
    it("should create Ram memory instance with default args", () => {
      new Controller({});
      expect(Memory).toHaveBeenCalledWith({
        size: 2,
        units: "GB",
        logLevel: "error",
        name: "RAM",
      });
    });
    it("should create Video memory instance with default args", () => {
      new Controller({});
      expect(Memory).toHaveBeenCalledWith({
        size: 1,
        units: "GB",
        logLevel: "error",
        name: "VIDEO",
      });
    });
    it("should create FrameQueue instance with default args", () => {
      new Controller({});
      expect(FrameQueue).toHaveBeenCalledWith({
        logLevel: "error",
        hwRank: 1,
        renderer: undefined,
      });
    });
    it("should create Network instance with default args", () => {
      new Controller({});
      expect(Network).toHaveBeenCalledWith({ loaders: 6 });
    });

    it("should have empty cache", () => {
      const controller = new Controller({});
      expect(controller.cache).toEqual(new Map());
    });
  });
});
