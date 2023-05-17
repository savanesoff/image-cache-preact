import Logger from "./logger";

export class Loader extends Logger {
  readonly url: string;
  readonly xmlHTTP: XMLHttpRequest;
  bytesTotal = 0;
  bytesLoaded = 0;
  loaded = false;
  loading = false;
  errored = false;
  progress = 0; // 0-1
  aborted = false;
  blob: Blob = {} as Blob;
  // TODO implement retry on error, timeout
  constructor(url: string) {
    super({
      name: "Loader",
      logLevel: "none",
    });
    this.url = url;
    this.xmlHTTP = new XMLHttpRequest();
    this.xmlHTTP.responseType = "arraybuffer";
    this.setHeaders();
    // assign event handlers
    this.xmlHTTP.onload = this.onLoaded;
    this.xmlHTTP.onloadstart = this.onStart;
    this.xmlHTTP.onprogress = this.onProgress;
    this.xmlHTTP.onerror = this.onError;
    this.xmlHTTP.onabort = this.onAborted;
    this.xmlHTTP.ontimeout = this.onTimeout;
  }

  abort() {
    this.xmlHTTP.abort();
  }

  load() {
    this.loading = true;
    this.xmlHTTP.open("GET", this.url, true);
    this.xmlHTTP.send();
  }

  private setHeaders() {
    this.xmlHTTP.setRequestHeader("Content-Type", "image/png");
    // xmlHTTP.setRequestHeader("Cache-Control", "max-age=0");
    // xmlHTTP.setRequestHeader("Cache-Control", "no-cache");
    // xmlHTTP.setRequestHeader("Cache-Control", "no-store");
    // xmlHTTP.setRequestHeader("Cache-Control", "must-revalidate");
    // xmlHTTP.setRequestHeader("Cache-Control", "proxy-revalidate");
    // xmlHTTP.setRequestHeader("Pragma", "no-cache");
    // xmlHTTP.setRequestHeader("Expires", "0");
    // set CORS to anonymous to avoid CORS error
    // xmlHTTP.setRequestHeader("Access-Control-Allow-Origin", "*");
  }

  private onLoaded() {
    this.blob = new Blob([this.xmlHTTP.response]);
    this.bytesTotal = this.blob.size;
    this.loaded = true;
    this.loading = false;
    this.progress = 1;
    this.emit("load", this);
  }

  private onProgress = (event: ProgressEvent<EventTarget>) => {
    this.bytesTotal = event.total;
    this.bytesLoaded = event.loaded;
    this.progress = event.loaded / event.total;
    this.emit("progress", this);
  };

  private onStart = () => {
    this.progress = 0;
    this.emit("start", this);
  };

  private onAborted = () => {
    this.aborted = true;
    this.loading = false;
    this.loaded = false;
    this.errored = true;
    this.log.error(["Aborted", this.url]);
    this.emit("abort", this);
  };

  private onTimeout = () => {
    this.loading = false;
    this.loaded = false;
    this.errored = true;
    this.log.error(["Timeout", this.url]);
    this.emit("timeout", this);
  };

  private onError = () => {
    this.loading = false;
    this.loaded = false;
    this.errored = true;
    this.log.error(["Error", this.url]);
    this.emit("error", this);
  };
}
