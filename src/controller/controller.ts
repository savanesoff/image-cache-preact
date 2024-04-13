/**
 * "BLIT" is an abbreviation for "Block Image Transfer".
 * In the context of computer graphics,
 * blitting is an operation where two bitmaps are combined into one using a boolean function.
 * In simpler terms, it's a way of moving blocks of raw pixel data from one place to another.
 * This is often used for copying a bitmap image (like a sprite or a tile) from memory to the screen (or vice versa),
 * or from one position on the screen to another position.
 *
 */
import { Img, ImgProps, ImgEvent } from "@/image";
import { LogLevel, Logger } from "@/logger";
import { Memory } from "@/memory";
import { Network } from "@/network";
import { UnitsType } from "@/utils";
import { FrameQueue, FrameQueueProps } from "@/frame-queue";

export type ControllerProps = FrameQueueProps & {
  ram?: number;
  video?: number;
  loaders?: number;
  units?: UnitsType;
  logLevel?: LogLevel;
};

const styles = {
  info: "color: green;",
  warn: "color: orange;",
  error: "color: red;",
  log: "color: skyblue;",
};

export class Controller extends Logger {
  readonly ram: Memory;
  readonly video: Memory;
  readonly updating = false;
  readonly cache = new Map<string, Img>();
  readonly frameQueue: FrameQueue;
  readonly network: Network;

  constructor({
    ram = 2,
    video = 1,
    loaders = 6,
    units = "GB",
    logLevel = "error",
    hwRank,
    renderer,
  }: ControllerProps) {
    super({
      name: "Master",
      logLevel,
      styles,
    });
    this.frameQueue = new FrameQueue({
      logLevel,
      hwRank,
      renderer,
    });
    this.network = new Network({ loaders });
    this.ram = new Memory({
      size: ram,
      units: units,
      logLevel,
      name: "RAM",
    });
    this.video = new Memory({
      size: video,
      units: units,
      logLevel,
      name: "VIDEO",
    });
  }

  //-----------------------   API   -----------------------

  getImage(props: ImgProps): Img {
    return this.cache.get(props.url) || this.#createImage(props);
  }

  //-----------------------   PRIVATE   -----------------------

  /**
   * Deletes an image from the cache
   * Calls the clear method of the image object
   * @param image
   */
  #deleteImage(image: Img) {
    this.cache.delete(image.url);
    image.clear();
  }

  /**
   * Creates a new image object and adds it to the cache
   * Image is added to the network to request loading immediately
   * Assigns event listeners to the image object to handle image loading and decoding
   * @param props
   * @returns
   */
  #createImage(props: ImgProps): Img {
    const image = new Img(props);
    this.cache.set(image.url, image); // TODO blob is network data, once we get image size any render of size will consume raw width/height data for ram
    image.on("loadend", this.#onImageLoadend);
    image.on("size", this.#onImageDecoded);
    image.on("render-request-added", this.#onRenderRequestAdded);
    image.on("render-request-removed", this.#onRenderRequestRemoved);
    this.network.add(image); // request load immediately
    return image;
  }

  /**
   * Adds video bytes of a render request to the video memory
   * @param event
   */
  #onRenderRequestAdded = (event: ImgEvent<"render-request-added">) => {
    this.#addVideoBytes(event.request.bytesVideo);
  };

  /**
   * Removes video bytes of a render request from the video memory
   * @param event
   */
  #onRenderRequestRemoved = (event: ImgEvent<"render-request-removed">) => {
    this.video.removeBytes(event.request.bytesVideo);
  };

  //-----------------------   VIDEO MEMORY MANAGEMENT   -----------------------

  /**
   * Adds bytes to the video memory
   * If video memory is overflown, it will emit a "video-overflow" event
   * @param bytes
   */
  #addVideoBytes(bytes: number) {
    const remainingBytes = this.video.addBytes(bytes);
    const overflow = remainingBytes < 0;
    const overflowBytes = Math.abs(remainingBytes);
    if (overflow && this.#requestVideo(overflowBytes) === false) {
      this.emit("video-overflow", { bytes: overflowBytes });
    }
  }

  /**
   * Requests video memory to free up bytes
   * Deletes unlocked render requests from the cache until enough bytes are freed
   * @param bytes
   * @returns true if enough bytes are freed, false otherwise
   */
  #requestVideo(bytes: number): boolean {
    let clearedBytes = 0;
    for (const image of this.cache.values()) {
      for (const request of image.renderRequests) {
        if (request.isLocked()) continue;
        clearedBytes += request.bytesVideo;
        request.clear();
        if (clearedBytes >= bytes) {
          return true;
        }
      }
    }
    return false;
  }

  //-----------------------   RAM MANAGEMENT   -----------------------

  /**
   * Adds image blob ram data to the ram
   * @param event
   */
  #onImageLoadend = (event: ImgEvent<"loadend">) => {
    this.#addRamBytes(event.target.bytes);
  };

  /**
   * Adds decoded image size ram data to the ram
   * @param event
   */
  #onImageDecoded = (event: ImgEvent<"size">) => {
    this.#addRamBytes(event.target.getBytesVideo(event.size));
  };

  /**
   * Adds bytes to the ram
   * If ram is overflown, it will emit a "ram-overflow" event
   * @param bytes
   */
  #addRamBytes(bytes: number) {
    const remainingBytes = this.ram.addBytes(bytes);
    const overflow = remainingBytes < 0;
    const overflowBytes = Math.abs(remainingBytes);
    if (overflow && this.#requestRam(overflowBytes) === false) {
      this.emit("ram-overflow", { bytes: overflowBytes });
    }
  }

  /**
   * Requests ram to free up bytes
   * Deletes unlocked images from the cache until enough bytes are freed
   * This will result in all render requests of the image being cleared
   * @param bytes
   * @returns true if enough bytes are freed, false otherwise
   */
  #requestRam(bytes: number): boolean {
    let clearedBytes = 0;
    for (const image of this.cache.values()) {
      if (image.isLocked()) continue;
      clearedBytes += image.getBytesRam();
      this.#deleteImage(image);
      if (clearedBytes >= bytes) {
        return true;
      }
    }
    return false;
  }
}
