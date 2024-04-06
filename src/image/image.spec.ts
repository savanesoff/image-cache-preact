import { Img } from "./image";
import { Bucket } from "../Bucket";
vi.useFakeTimers();
const createBucket = (): Bucket => {
  return {
    clearSize: vi.fn(),
    addSize: vi.fn(),
  } as unknown as Bucket;
};
globalThis.URL.createObjectURL = vi.fn(() => "blob:test");
describe("Img", () => {
  let image: Img;
  beforeEach(() => {
    image = new Img({
      url: "test",
    });
  });

  it("should be defined", () => {
    expect(image).toBeDefined();
  });

  it("should assign on loadend event", () => {
    image.blob = new Blob();
    image.emit("loadend");
    expect(image.element.src).toBe("blob:test");
  });

  it("should emit size event on image load cb", () => {
    const spe = vi.fn();
    image.on("size", spe);
    image.emit("loadend");
    image.element.width = 100;
    image.element.height = 100;
    image.element.onload?.(new Event("load"));
    expect(image.gotSize).toBe(true);
    expect(image.element.onload).toBeNull();
    expect(image.element.onerror).toBeNull();
    expect(spe).toHaveBeenCalledWith({
      event: "size",
      target: image,
      with: 100,
      height: 100,
    });
  });

  it("should emit error event on image load error cb", () => {
    const spe = vi.fn();
    image.on("error", spe);
    image.emit("loadend");
    image.element.onerror?.(new Event("error"));
    expect(spe).toHaveBeenCalledWith({
      event: "error",
      target: image,
    });
  });

  it("should clear image", () => {
    image.emit("loadend");
    image.clear();
    expect(image.element.src).toBe("");
    expect(image.gotSize).toBe(false);
    expect(image.element.onload).toBeNull();
    expect(image.element.onerror).toBeNull();
  });

  it("should get bytes video", () => {
    expect(image.getBytesVideo({ width: 100, height: 100 })).toBe(40000);
  });

  it("should add bucket", () => {
    const bucket = createBucket();
    image.addBucket(bucket);
    expect(image.buckets.size).toBe(1);
  });

  it("should remove bucket", () => {
    const bucket = createBucket();
    image.addBucket(bucket);
    image.removeBucket(bucket);
    expect(image.buckets.size).toBe(0);
  });

  it("should return true if image is locked", () => {
    const bucket = createBucket();
    bucket.isLocked = vi.fn(() => true);
    image.addBucket(bucket);
    expect(image.isLocked()).toBe(true);
  });

  it("should return false if image is not locked", () => {
    const bucket = createBucket();
    bucket.isLocked = vi.fn(() => false);
    image.addBucket(bucket);
    expect(image.isLocked()).toBe(false);
  });

  it("should render size", () => {
    const bucket = createBucket();
    image.renderSize({ size: { width: 100, height: 100 }, bucket });
    expect(image.renderState.size).toBe(1);
  });

  it("should request load", () => {
    const spy = vi.fn();
    image.on("request-load", spy);
    const bucket = createBucket();
    image.renderSize({ size: { width: 100, height: 100 }, bucket });
    expect(spy).toHaveBeenCalledWith({
      event: "request-load",
      target: image,
    });
  });

  it("should not emit request-load more than once", () => {
    const spy = vi.fn();
    image.on("request-load", spy);
    const bucket = createBucket();
    image.renderSize({ size: { width: 100, height: 100 }, bucket });
    image.renderSize({ size: { width: 100, height: 100 }, bucket });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should not request-render if no image size available", () => {
    const spy = vi.fn();
    image.on("request-render", spy);
    image.element.onload?.(new Event("load"));
    const bucket = createBucket();
    image.renderSize({ size: { width: 100, height: 100 }, bucket });
    image.renderSize({ size: { width: 100, height: 100 }, bucket });
    expect(spy).not.toHaveBeenCalled();
  });
});
