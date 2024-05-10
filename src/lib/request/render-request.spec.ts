import { Bucket } from "@lib/bucket";
import { Controller } from "@lib//controller";
import { RenderRequest } from "./render-request";
import { Img, Size } from "../image";
import { FrameQueue } from "../frame-queue";

vi.mock("@lib/image");
vi.mock("@lib/bucket");
vi.mock("@lib/controller");
vi.mock("@lib/frame-queue");

const imageSize = () => ({
  width: Math.round(Math.random() * 100),
  height: Math.round(Math.random() * 100),
});

const mockBytesVideo = Math.round(Math.random() * 100);

const createBucket = ({
  url = "test",
  imageLoaded,
}: {
  url?: string;
  imageLoaded?: boolean;
} = {}): Bucket => {
  const image = new Img({ url });
  image.loaded = imageLoaded || false;
  // @ts-expect-error - mock api
  image.getBytesVideo.mockReturnValue(mockBytesVideo);
  const controller = new Controller({});
  const frameQueue = new FrameQueue({});
  // @ts-expect-error - mock api for readonly
  controller.frameQueue = frameQueue;
  const bucket = new Bucket({ name: "test", controller });
  bucket.controller = controller;
  // @ts-expect-error - mock api
  bucket.controller.getImage.mockImplementation(() => image);
  return bucket;
};

const createRequest = ({
  url = "test",
  size,
  bucket,
  imageLoaded,
}: {
  url?: string;
  size?: Size;
  bucket?: Bucket;
  imageLoaded?: boolean;
} = {}): RenderRequest => {
  const sizeProps = size || imageSize();
  return new RenderRequest({
    size: sizeProps,
    bucket: bucket || createBucket({ url, imageLoaded }),
    url,
  });
};

describe("RenderRequest", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  it("should create an instance", () => {
    expect(createRequest()).toBeTruthy();
  });

  it("should have size assigned", () => {
    const size = imageSize();
    const request = createRequest({ size });
    expect(request.size).toEqual(size);
  });

  it("should have bucket assigned", () => {
    const bucket = createBucket();
    const request = createRequest({ bucket });
    expect(request.bucket).toEqual(bucket);
  });

  it("should have frameQueue assigned", () => {
    const bucket = createBucket();
    const request = createRequest({ bucket });
    expect(request.frameQueue).toEqual(bucket.controller.frameQueue);
  });

  it("should have image assigned", () => {
    const request = createRequest();
    // @ts-expect-error - mock api
    expect(request.image).toEqual(request.bucket.controller.getImage());
  });

  it("should have bytesVideo of size assigned", () => {
    const request = createRequest();
    expect(request.bytesVideo).toBe(mockBytesVideo);
    expect(request.image.getBytesVideo).toHaveBeenCalledWith(request.size);
  });

  it("should register request on image", () => {
    const request = createRequest();
    expect(request.image.registerRequest).toHaveBeenCalledWith(request);
  });

  it("should return request on bucket", () => {
    const request = createRequest();
    expect(request.bucket.registerRequest).toHaveBeenCalledWith(request);
  });

  it("should register image size listener if image.loaded:false", () => {
    const request = createRequest();
    expect(request.image.on).toHaveBeenCalledWith("size", request.request);
  });

  it("should not register image size listener if image.loaded:true", () => {
    const request = createRequest({ imageLoaded: true });
    expect(request.image.on).not.toHaveBeenCalled();
  });

  it("should emit onloadend if image loaded", () => {
    const spy = vi.spyOn(RenderRequest.prototype, "emit");
    createRequest({ imageLoaded: true });
    expect(spy).toHaveBeenCalledWith("loadend");
  });

  it("should add request to frame queue", () => {
    const request = createRequest({ imageLoaded: true });
    expect(request.frameQueue.add).toHaveBeenCalledWith(request);
  });

  describe("onRendered", () => {
    it("should set rendered to true", () => {
      const request = createRequest();
      request.onRendered();
      expect(request.rendered).toBe(true);
    });

    it("should emit rendered event", () => {
      const request = createRequest();
      const spy = vi.spyOn(RenderRequest.prototype, "emit");
      request.onRendered();
      expect(spy).toHaveBeenCalledWith("rendered");
    });
  });

  describe("onProcessing", () => {
    it("should emit processing event", () => {
      const request = createRequest();
      const spy = vi.spyOn(RenderRequest.prototype, "emit");
      request.onProcessing();
      expect(spy).toHaveBeenCalledWith("processing");
    });
  });

  describe("clear", () => {
    let request: RenderRequest;
    beforeEach(() => {
      request = createRequest();
      request.clear();
    });
    it("should unregister from image", () => {
      expect(request.image.unregisterRequest).toHaveBeenCalledWith(request);
    });

    it("should unregister from bucket", () => {
      expect(request.bucket.unregisterRequest).toHaveBeenCalledWith(request);
    });

    it("should remove size listener", () => {
      expect(request.image.off).toHaveBeenCalledWith("size", request.request);
    });

    it("should emit clear event", () => {
      const request = createRequest();
      const spy = vi.spyOn(RenderRequest.prototype, "emit");
      request.clear();
      expect(spy).toHaveBeenCalledWith("clear");
    });
  });

  describe("isLocked", () => {
    let request: RenderRequest;
    beforeEach(() => {
      request = createRequest();
    });

    it("should return false if bucket is not locked", () => {
      request.bucket.locked = false;
      expect(request.isLocked()).toBe(false);
    });

    it("should return true if bucket is locked", () => {
      request.bucket.locked = true;
      expect(request.isLocked()).toBe(true);
    });
  });
});
