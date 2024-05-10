import { IMAGE_TYPE_BYTES, Img, Size } from "./image";
import { RenderRequest } from "@lib/request";
import { Bucket } from "@lib/bucket";
import { Controller } from "@lib/controller";

vi.useFakeTimers();
const createBucket = (): Bucket => {
  return {
    emit: vi.fn(),
    controller: {} as unknown as Controller,
  } as unknown as Bucket;
};
const blobData = "blob:test";
const size = Math.round(Math.random() * 100);

const createRequest = (size: Size, bucket: Bucket): RenderRequest => {
  return {
    emit: vi.fn(),
    bucket,
    size,
  } as unknown as RenderRequest;
};

describe("Img", () => {
  let image: Img;
  beforeEach(() => {
    image = new Img({
      url: "test",
    });
    globalThis.URL.createObjectURL = vi.fn(() => blobData);
  });
  afterEach(() => {
    // vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it("should be defined", () => {
    expect(image).toBeDefined();
  });

  it("should have element", () => {
    expect(image.element).toBeDefined();
  });

  describe("on data loaded", () => {
    let sizeEventSpy: () => void;
    beforeEach(() => {
      image.blob = new Blob(); // when loader is done the blob is set
      image.element.width = size; // because its hard to mock the image element
      image.element.height = size;
      sizeEventSpy = vi.fn();
      image.on("size", sizeEventSpy);
      image.emit("loadend"); // called by loader
      image.element.onload?.(new Event("load")); // triggered by 'loadend' event
    });

    it("should have .element.src assigned", () => {
      expect(image.element.src).toBe(blobData);
    });

    it("should have .gotSize set to true", () => {
      expect(image.gotSize).toBe(true);
    });

    it("should remove .element.onload handler", () => {
      expect(image.element.onload).toBeNull();
    });

    it("should remove .element.onerror handler", () => {
      expect(image.element.onerror).toBeNull();
    });
    it("should emit size event once on image load cb", () => {
      expect(sizeEventSpy).toHaveBeenCalledTimes(1);
    });

    it("should emit size event with correct props", () => {
      expect(sizeEventSpy).toHaveBeenCalledWith({
        type: "size",
        target: image,
        size: { width: size, height: size },
      });
    });

    it("should have bytesUncompressed set", () => {
      expect(image.bytesUncompressed).toBe(
        size * size * IMAGE_TYPE_BYTES[image.type],
      );
    });
  });
});
