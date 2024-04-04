import { Logger } from "@/logger";

export type MIMEType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

type Events =
  | "loadstart"
  | "progress"
  | "loadend"
  | "abort"
  | "timeout"
  | "error"
  | "retry";

export type Resource = {
  url: string;
  mimeType?: MIMEType;
  retry?: number;
};

/**
 * Represents a loader for loading resources via XMLHttpRequest.
 */
export class Loader extends Logger {
  static loaded = 0;
  static errored = 0;
  static aborted = 0;
  static timeout = 0;
  readonly url: string;
  readonly xhr: XMLHttpRequest;
  bytesTotal = 0;
  bytesLoaded = 0;
  timeout = false;
  loaded = false;
  loading = false;
  errored = false;
  progress = 0; // 0-1
  aborted = false;
  pending = false;
  blob: Blob = {} as Blob;
  mimeType: MIMEType = "image/jpeg";
  retry = 3;
  retries = 0;

  /**
   * Constructs a new Loader instance.
   * @param url - The URL of the resource to load.
   * @param mimeType - The MIME type of the resource. Defaults to "image/jpeg".
   */
  constructor({ url, mimeType = "image/jpeg", retry }: Resource) {
    super({
      name: "Loader",
      logLevel: "error",
    });
    this.url = url;
    this.mimeType = mimeType;
    this.retry = retry ?? this.retry;
    this.xhr = new XMLHttpRequest();
    // assign event handlers
    this.xhr.onload = this.onLoaded;
    this.xhr.onloadstart = this.onLoadStart;
    this.xhr.onprogress = this.onProgress;
    this.xhr.onerror = this.onError;
    this.xhr.onabort = this.onAborted;
    this.xhr.ontimeout = this.onTimeout;
  }

  /**
   * Aborts the loading process.
   */
  abort() {
    this.xhr.abort();
  }

  /**
   * Starts loading the resource.
   */
  load() {
    this.pending = true;
    this.xhr.responseType = "arraybuffer";
    this.xhr.open("GET", this.url, true);
    this.setHeaders();
    this.xhr.send();
  }

  private setHeaders() {
    this.xhr.setRequestHeader("Content-Type", this.mimeType);
    // xhr.setRequestHeader("Cache-Control", "max-age=0");
    // xhr.setRequestHeader("Cache-Control", "no-cache");
    // xhr.setRequestHeader("Cache-Control", "no-store");
    // xhr.setRequestHeader("Cache-Control", "must-revalidate");
    // xhr.setRequestHeader("Cache-Control", "proxy-revalidate");
    // xhr.setRequestHeader("Pragma", "no-cache");
    // xhr.setRequestHeader("Expires", "0");
    // set CORS to anonymous to avoid CORS error
    // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  }

  private onLoaded = () => {
    this.blob = new Blob([this.xhr.response]);
    this.bytesTotal = this.blob.size;
    this.loaded = true;
    this.loading = false;
    this.progress = 1;
    Loader.loaded++;
    this.log.verbose(["Loaded", this.url]);
    this.emit("loadend");
  };

  private onProgress = (event: ProgressEvent<EventTarget>) => {
    this.bytesTotal = event.total;
    this.bytesLoaded = event.loaded;
    this.progress = event.loaded / event.total;
    this.log.verbose(["Progress", this.url, this.progress]);
    this.emit("progress");
  };

  private onLoadStart = () => {
    this.loading = true;
    this.pending = false;
    this.log.verbose(["Start", this.url]);
    this.emit("loadstart");
  };

  private onAborted = () => {
    this.aborted = true;
    this.loading = false;
    this.loaded = false;
    Loader.aborted++;
    this.log.verbose(["Aborted", this.url]);
    this.emit("abort");
  };

  private retryLoad() {
    if (this.retries < this.retry) {
      this.retries++;
      this.emit("retry");
      this.load();
      return true;
    }
    return false;
  }

  private onTimeout = () => {
    if (this.retryLoad()) {
      return;
    }
    this.loading = false;
    this.loaded = false;
    this.timeout = true;
    Loader.timeout++;
    this.log.error(["Timeout", this.url]);
    this.emit("timeout");
  };

  private onError = () => {
    if (this.retryLoad()) {
      return;
    }
    this.loading = false;
    this.loaded = false;
    this.errored = true;
    Loader.errored++;
    this.log.error(["Error", this.url]);
    this.emit("error");
  };

  on(event: Events, listener: () => void): this {
    super.on(event, listener);
    return this;
  }

  emit(event: Events): boolean {
    return super.emit(event, this);
  }
}
