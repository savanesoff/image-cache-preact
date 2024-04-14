import { Bucket } from "./bucket";
import { Event as ImageEvent, Img } from "@/image";

const name = "TestBucket";

vi.mock("@/image");

const createImages = (count: number) => {
  const images = [];
  for (let i = 0; i < count; i++) {
    images.push(
      new Img({
        url: `image-${i}`,
      })
    );
  }
  return images;
};

const createSizeRenderedEvent = ({
  image,
  bucket,
  key,
}: {
  image: Img;
  bucket: Bucket;
  key: string;
}) => {
  const event: ImageEvent<"size-rendered"> = {
    request: {
      key,
      size: {
        width: 100,
        height: 100,
      },
      buckets: new Set([bucket]),
      bytes: 100,
      rendered: false,
      requested: false,
    },
    target: image,
    event: "size-rendered",
  };
  return event;
};
describe("Bucket", () => {
  describe("constructor", () => {
    let bucket: Bucket;

    beforeEach(() => {
      bucket = new Bucket({ name });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should be defined", () => {
      expect(bucket).toBeDefined();
    });

    it("should have a name", () => {
      expect(bucket.name).toBe(`Bucket:${name}`);
    });

    it("should be unlocked", () => {
      expect(bucket.locked).toBe(false);
    });

    it("should have load false", () => {
      expect(bucket.load).toBe(false);
    });

    it("should not have size", () => {
      expect(bucket.size).toBeNull();
    });

    it("should have defaultURL", () => {
      expect(bucket.defaultURL).toBeDefined();
    });
  });

  describe("addImage", () => {
    let bucket: Bucket;
    let images: Img[];

    beforeEach(() => {
      bucket = new Bucket({ name });
      images = createImages(5);
      bucket.addImages(images);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should add images to bucket", () => {
      for (const image of images) {
        expect(bucket.images.has(image)).toBe(true);
      }
    });

    it("should add event listeners", () => {
      for (const image of images) {
        expect(image.on).toHaveBeenCalledTimes(6);
      }
    });

    it("should not request load if load", () => {
      for (const image of images) {
        expect(image.requestLoad).not.toHaveBeenCalled();
      }
    });

    it("should request load if load", () => {
      bucket = new Bucket({ name, load: true });
      bucket.addImages(images);
      for (const image of images) {
        expect(image.requestLoad).toHaveBeenCalled();
      }
    });
  });

  describe("removeImage", () => {
    let bucket: Bucket;
    let images: Img[];

    beforeEach(() => {
      bucket = new Bucket({ name });
      images = createImages(5);
      bucket.addImages(images);
      bucket.removeImage(images[0]);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should remove image from bucket", () => {
      expect(bucket.images.has(images[0])).toBe(false);
    });

    it("should remove event listeners", () => {
      expect(images[0].off).toHaveBeenCalledTimes(6);
    });
  });

  describe("onImageSizeRendered", () => {
    let bucket: Bucket;
    let images: Img[];

    beforeEach(() => {
      bucket = new Bucket({ name });
      images = createImages(5);
      bucket.addImages(images);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should store size requests", () => {
      const event = createSizeRenderedEvent({
        image: images[0],
        bucket,
        key: "test",
      });
      bucket.onImageSizeRendered(event);
      expect(bucket.sizeRequests.get("test")).toEqual({
        size: event.request.size,
        images: expect.any(Set),
      });

      expect(bucket.sizeRequests.get("test")?.images.has(images[0])).toBe(true);
    });

    it("should not store size requests if request does not contain bucket", () => {
      const event = createSizeRenderedEvent({
        image: images[0],
        bucket: new Bucket({ name: "test" }),
        key: "test",
      });
      bucket.onImageSizeRendered(event);
      expect(bucket.sizeRequests.get("test")).toBeUndefined();
    });
  });

  describe("onImageSizeCleared", () => {
    let bucket: Bucket;
    let images: Img[];

    beforeEach(() => {
      bucket = new Bucket({ name });
      images = createImages(5);
      bucket.addImages(images);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should remove size requests", () => {
      const event = createSizeRenderedEvent({
        image: images[0],
        bucket,
        key: "test",
      });
      bucket.onImageSizeRendered(event);
      expect(bucket.sizeRequests.get("test")).toBeDefined();
      bucket.onImageSizeCleared(event as unknown as ImageEvent<"size-cleared">);
      expect(bucket.sizeRequests.get("test")).toBeUndefined();
    });
  });
});
