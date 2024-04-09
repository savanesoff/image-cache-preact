import { Logger } from "@/logger";

export type MIMEType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
export type Events =
  | "loadstart"
  | "progress"
  | "loadend"
  | "abort"
  | "timeout"
  | "error"
  | "retry";

type Headers = {
  "Content-Type": string;
  "Cache-Control"?: string;
  Expires?: string;
};

export type Event = {
  event: Events;
  target: Loader;
};

export type EventHandler = (event: Event) => void;

export type LoaderProps = {
  url: string;
  headers?: Headers | null;
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
  bytes = 0;
  bytesLoaded = 0;
  timeout = false;
  loaded = false;
  loading = false;
  errored = false;
  progress = 0; // 0-1
  aborted = false;
  pending = false;
  blob: Blob | null = null;
  headers: Headers | null;
  retry = 3;
  retries = 0;

  /**
   * Constructs a new Loader instance.
   * @param url - The URL of the resource to load.
   * @param mimeType - The MIME type of the resource. Defaults to "image/jpeg".
   */
  constructor({ url, headers = null, retry }: LoaderProps) {
    super({
      name: "Loader",
      logLevel: "error",
    });
    this.url = url;
    this.headers = headers;
    this.retry = retry ?? this.retry;
    this.xhr = new XMLHttpRequest();
    // assign event handlers
    this.xhr.onload = this.onLoaded;
    this.xhr.onloadstart = this.onLoadStart;
    this.xhr.onprogress = this.onProgress;
    this.xhr.onerror = this.onLoadError;
    this.xhr.onabort = this.onLoadAborted;
    this.xhr.ontimeout = this.onLoadTimeout;
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
    if (!this.headers) {
      return;
    }
    const headers = Object.entries(this.headers) as [keyof Headers, string][];
    headers.forEach(([key, value]) => {
      this.xhr.setRequestHeader(key, value);
    });
  }

  private onLoaded = () => {
    this.blob = new Blob([this.xhr.response]);
    this.bytes = this.blob.size;
    this.loaded = true;
    this.loading = false;
    this.progress = 1;
    Loader.loaded++;
    this.log.verbose(["Loaded", this.url]);
    this.emit("loadend");
  };

  private onProgress = (event: ProgressEvent<EventTarget>) => {
    this.bytes = event.total;
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

  private onLoadAborted = () => {
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

  private onLoadTimeout = () => {
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

  private onLoadError = () => {
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

  on(event: Events, handler: EventHandler): this {
    super.on(event, handler);
    return this;
  }

  emit(event: Events, data?: Record<string, unknown>): boolean {
    return super.emit(event, { ...data, event, target: this });
  }
}
