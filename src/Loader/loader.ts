import Logger from "../logger";

type MIMEType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
interface LoaderProps {
  url: string;
  mimeType?: MIMEType;
}

export class Loader extends Logger {
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
  // TODO implement retry on error, timeout
  constructor({ url, mimeType: mimeType = "image/jpeg" }: LoaderProps) {
    super({
      name: "Loader",
      logLevel: "error",
    });
    this.url = url;
    this.mimeType = mimeType;
    this.xhr = new XMLHttpRequest();
    // assign event handlers
    this.xhr.onload = this.onLoaded;
    this.xhr.onloadstart = this.onLoadStart;
    this.xhr.onprogress = this.onProgress;
    this.xhr.onerror = this.onError;
    this.xhr.onabort = this.onAborted;
    this.xhr.ontimeout = this.onTimeout;
  }

  abort() {
    this.xhr.abort();
  }

  /**
   * Starts loading the resource
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
    this.log.verbose(["Loaded", this.url]);
    this.emit("loadEnd", this);
  };

  private onProgress = (event: ProgressEvent<EventTarget>) => {
    this.bytesTotal = event.total;
    this.bytesLoaded = event.loaded;
    this.progress = event.loaded / event.total;
    this.log.verbose(["Progress", this.url, this.progress]);
    this.emit("progress", this);
  };

  private onLoadStart = () => {
    this.loading = true;
    this.pending = false;
    this.log.verbose(["Start", this.url]);
    this.emit("loadStart", this);
  };

  private onAborted = () => {
    this.aborted = true;
    this.loading = false;
    this.loaded = false;
    this.log.verbose(["Aborted", this.url]);
    this.emit("abort", this);
  };

  private onTimeout = () => {
    this.loading = false;
    this.loaded = false;
    this.timeout = true;
    this.log.error(["Timeout", this.url]);
    this.emit("timeout", this);
  };

  private onError = (event: ProgressEvent<EventTarget>) => {
    this.loading = false;
    this.loaded = false;
    this.errored = true;
    this.log.error(["Error", this.url, event]);
    this.emit("error", this, event);
  };
}
