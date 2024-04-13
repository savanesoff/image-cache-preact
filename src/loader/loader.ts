import { Logger } from "@/logger";

export type MIMEType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export type Headers = {
  "Content-Type": MIMEType;
  "Cache-Control"?: string;
  Expires?: string;
};

export type LoaderEventTypes =
  | "loadstart"
  | "progress"
  | "loadend"
  | "abort"
  | "timeout"
  | "error"
  | "retry";

export type ProgressEventLoader = {
  progress: number;
};

export type ErrorEventLoader = {
  statusText: string;
  status: number;
};

export type RetryEventLoader = {
  retries: number;
};

export type LoaderEvent<T extends LoaderEventTypes> = {
  type: T;
  target: Loader;
} & (T extends "progress" ? ProgressEventLoader : unknown) &
  (T extends "error" ? ErrorEventLoader : unknown) &
  (T extends "retry" ? RetryEventLoader : unknown);

export type LoaderEventHandler<T extends LoaderEventTypes> = (
  event: LoaderEvent<T>,
) => void;

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
    // assign event handlers
    this.xhr.onload = this.#onLoaded;
    this.xhr.onloadstart = this.#onLoadStart;
    this.xhr.onprogress = this.#onProgress;
    this.xhr.onerror = this.#onLoadError;
    this.xhr.onabort = this.#onLoadAborted;
    this.xhr.ontimeout = this.#onLoadTimeout;
    this.xhr.responseType = "arraybuffer";
    this.xhr.open("GET", this.url, true);
    this.#setHeaders();
    this.xhr.send();
  }

  isLoading() {
    return this.pending || this.loading;
  }

  #setHeaders() {
    if (!this.headers) {
      return;
    }
    const headers = Object.entries(this.headers) as [keyof Headers, string][];
    headers.forEach(([key, value]) => {
      this.xhr.setRequestHeader(key, value);
    });
  }

  #onLoaded = () => {
    this.blob = new Blob([this.xhr.response]);
    this.bytes = this.blob.size;
    this.loaded = true;
    this.loading = false;
    this.progress = 1;
    Loader.loaded++;
    this.log.verbose(["Loaded", this.url]);
    this.emit("loadend");
  };

  #onProgress = (event: ProgressEvent<EventTarget>) => {
    this.bytes = event.total;
    this.bytesLoaded = event.loaded;
    this.progress = parseFloat((event.loaded / event.total).toFixed(2));
    this.log.verbose(["Progress", this.url, this.progress]);
    this.emit("progress", { progress: this.progress });
  };

  #onLoadStart = () => {
    this.loading = true;
    this.pending = false;
    this.log.verbose(["Start", this.url]);
    this.emit("loadstart");
  };

  #onLoadAborted = () => {
    this.aborted = true;
    this.loading = false;
    this.loaded = false;
    Loader.aborted++;
    this.log.verbose(["Aborted", this.url]);
    this.emit("abort");
  };

  #retryLoad() {
    if (this.retries < this.retry) {
      this.retries++;
      this.emit("retry", { retries: this.retries });
      this.load();
      return true;
    }
    return false;
  }

  #onLoadTimeout = () => {
    if (this.#retryLoad()) {
      return;
    }
    this.loading = false;
    this.loaded = false;
    this.timeout = true;
    Loader.timeout++;
    this.log.error(["Timeout", this.url]);
    this.emit("timeout");
  };

  #onLoadError = () => {
    if (this.#retryLoad()) {
      return;
    }

    this.loading = false;
    this.loaded = false;
    this.errored = true;
    Loader.errored++;
    this.log.error(["Error", this.url]);
    this.emit("error", {
      statusText: this.xhr.statusText,
      status: this.xhr.status,
    });
  };

  on<T extends LoaderEventTypes>(
    type: T,
    handler: T extends LoaderEventTypes ? LoaderEventHandler<T> : never,
  ): this {
    super.on(type, handler);
    return this;
  }

  off<T extends LoaderEventTypes>(
    type: T,
    handler: T extends LoaderEventTypes ? LoaderEventHandler<T> : never,
  ): this {
    super.off(type, handler);
    return this;
  }

  emit<T extends LoaderEventTypes>(
    type: T,
    data?: Omit<LoaderEvent<T>, "target" | "type">,
  ): boolean {
    return super.emit(type, { ...data, type, target: this });
  }
}
