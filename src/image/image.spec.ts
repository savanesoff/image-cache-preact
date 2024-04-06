import { Img, RenderRequest } from "./image";
import { Bucket } from "../Bucket";

vi.useFakeTimers();
const createBucket = (): Bucket => {
  return {
    clearSize: vi.fn(),
    addSize: vi.fn(),
    emit: vi.fn(),
  } as unknown as Bucket;
};
const blobData = "blob:test";
const size = Math.round(Math.random() * 100);

const createRequest = (size: number): [string, RenderRequest] => {
  const key = `${size}x${size}`;
  return [
    key,
    {
      key: `${size}x${size}`,
      size: { width: size, height: size },
      bytes: 40000,
      rendered: false,
      requested: false,
      buckets: new Set([createBucket(), createBucket()]),
    },
  ];
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

  describe("on data loaded (see loader for details)", () => {
    let sizeEventSpy: () => void;
    let requestRenderSpy: () => void;
    beforeEach(() => {
      image.blob = new Blob(); // when loader is done the blob is set
      image.element.width = size; // because its hard to mock the image element
      image.element.height = size;
      sizeEventSpy = vi.fn();
      requestRenderSpy = vi.fn();
      image.on("request-render", requestRenderSpy);
      image.on("size", sizeEventSpy);
      image.renderRequests.set(...createRequest(size));
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

    it("should emit size event with correct event prop names", () => {
      expect(sizeEventSpy).toHaveBeenCalledWith({
        event: expect.anything(),
        target: expect.anything(),
        with: expect.anything(),
        height: expect.anything(),
      });
    });

    it("should emit size event with event name 'size'", () => {
      expect(sizeEventSpy).toHaveBeenCalledWith({
        event: "size",
        target: expect.anything(),
        with: expect.anything(),
        height: expect.anything(),
      });
    });

    it("should emit size event with correct width/height", () => {
      expect(sizeEventSpy).toHaveBeenCalledWith({
        event: expect.anything(),
        target: expect.anything(),
        with: size,
        height: size,
      });
    });

    it("should emit size event with correct target", () => {
      expect(sizeEventSpy).toHaveBeenCalledWith({
        event: expect.anything(),
        target: image,
        with: expect.anything(),
        height: expect.anything(),
      });
    });

    it("should emit request-render event on image load cb", () => {
      expect(requestRenderSpy).toHaveBeenCalled();
    });

    it("should emit request-render event with correct event prop names", () => {
      expect(requestRenderSpy).toHaveBeenCalledWith({
        event: expect.anything(),
        target: expect.anything(),
        request: expect.anything(),
      });
    });

    it("should emit request-render event with event name 'request-render'", () => {
      expect(requestRenderSpy).toHaveBeenCalledWith({
        event: "request-render",
        target: expect.anything(),
        request: expect.anything(),
      });
    });

    it("should emit request-render event with correct request", () => {
      expect(requestRenderSpy).toHaveBeenCalledWith({
        event: expect.anything(),
        target: expect.anything(),
        request: image.renderRequests.get(`${size}x${size}`),
      });
    });

    it("should emit request-render event with correct target", () => {
      expect(requestRenderSpy).toHaveBeenCalledWith({
        event: expect.anything(),
        target: image,
        request: expect.anything(),
      });
    });

    it("should emit render-requested event on image load cb", () => {
      for (const request of image.renderRequests.values()) {
        for (const bucket of request.buckets) {
          expect(bucket.emit).toHaveBeenCalledTimes(1);
          expect(bucket.emit).toHaveBeenCalledWith("render-requested", {
            request,
          });
        }
      }
    });
  });

  describe("request render", () => {
    const requestLoadSpy = vi.fn();
    beforeEach(() => {
      image.gotSize = true;
      image.renderRequests.set(...createRequest(size));
      image.on("request-load", requestLoadSpy);
      image.requestSize({
        size: {
          width: size,
          height: size,
        },
        bucket: createBucket(),
      });
    });

    it("should emit request-render event", () => {
      expect(requestLoadSpy).toHaveBeenCalledTimes(1);
    });

    it("should not call requestLoad if request is already requested", () => {
      image.requestSize({
        size: {
          width: size,
          height: size,
        },
        bucket: createBucket(),
      });
      expect(requestLoadSpy).toHaveBeenCalledTimes(1);
    });

    it("should add new bucket to request", () => {
      const bucket = createBucket();
      image.requestSize({
        size: {
          width: size,
          height: size,
        },
        bucket,
      });
      for (const request of image.renderRequests.values()) {
        expect(request.buckets).toContain(bucket);
      }
    });

    it("should not emit render-requested event if image not loaded", () => {
      for (const bucket of image.renderRequests.values().next().value.buckets) {
        expect(bucket.emit).not.toHaveBeenCalled();
      }
    });

    it("should emit render-requested event if image loaded", () => {
      image.emit("loadend");
      image.element.onload?.(new Event("load"));
      for (const request of image.renderRequests.values()) {
        for (const bucket of request.buckets) {
          expect(bucket.emit).toHaveBeenCalledTimes(1);
          expect(bucket.emit).toHaveBeenCalledWith("render-requested", {
            request,
          });
        }
      }
    });
  });

  describe("ClearSize()", () => {
    let clearEventSpy: () => void;
    beforeEach(() => {
      clearEventSpy = vi.fn();
      image.renderRequests.set(...createRequest(size));
      image.on("clear-size", clearEventSpy);
      image.clearSize({ width: size, height: size });
    });

    it("should remove request from renderRequests", () => {
      expect(image.renderRequests.size).toBe(0);
    });

    it("should call bucket render-clear event", () => {
      for (const request of image.renderRequests.values()) {
        for (const bucket of request.buckets) {
          expect(bucket.clearSize).toHaveBeenCalledTimes(1);
          expect(bucket.clearSize).toHaveBeenCalledWith({ request });
        }
      }
    });

    it("should emit clear-size event", () => {
      expect(clearEventSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("onSizeRendered()", () => {
    let sizeRenderedSpy: () => void;
    beforeEach(() => {
      sizeRenderedSpy = vi.fn();
      image.renderRequests.set(...createRequest(size));
      image.on("size-rendered", sizeRenderedSpy);
      image.onSizeRendered(
        image.renderRequests.get(`${size}x${size}`) as RenderRequest
      );
    });

    it("should set request.rendered to true", () => {
      for (const request of image.renderRequests.values()) {
        expect(request.rendered).toBe(true);
      }
    });

    it("should emit render-ready bucket event", () => {
      for (const request of image.renderRequests.values()) {
        for (const bucket of request.buckets) {
          expect(bucket.emit).toHaveBeenCalledTimes(1);
          expect(bucket.emit).toHaveBeenCalledWith("render-ready", { request });
        }
      }
    });

    it("should emit size-rendered event", () => {
      expect(sizeRenderedSpy).toHaveBeenCalledTimes(1);
    });

    it("should emit size-rendered event with correct event prop names", () => {
      expect(sizeRenderedSpy).toHaveBeenCalledWith({
        event: expect.anything(),
        target: expect.anything(),
        request: expect.anything(),
      });
    });

    it("should emit size-rendered event with event name 'size-rendered'", () => {
      expect(sizeRenderedSpy).toHaveBeenCalledWith({
        event: "size-rendered",
        target: expect.anything(),
        request: expect.anything(),
      });
    });

    it("should emit size-rendered event with correct request", () => {
      expect(sizeRenderedSpy).toHaveBeenCalledWith({
        event: expect.anything(),
        target: expect.anything(),
        request: image.renderRequests.get(`${size}x${size}`),
      });
    });

    it("should emit size-rendered event with correct target", () => {
      expect(sizeRenderedSpy).toHaveBeenCalledWith({
        event: expect.anything(),
        target: image,
        request: expect.anything(),
      });
    });
  });
});
