import { Bucket } from "./Bucket";
import { Master, UNITS } from "./master";
import { Network } from "./network";
import defaultURL from "./../assets/default.png";

export class ImageItem {
  URL: string;
  buckets = new Set<Bucket>();
  ram = 0;
  video = 0;
  loaded = false;
  loading = false;
  def: HTMLImageElement;
  cached: HTMLImageElement;
  rendered = false;

  constructor(URL: string, bucket?: Bucket) {
    this.URL = URL;
    this.cached = new Image();
    this.cached.src = defaultURL;
    this.def = new Image();
    this.def.src = defaultURL;
    if (bucket) this.addBucket(bucket);
  }

  addBucket(bucket: Bucket) {
    this.buckets.add(bucket);
    if (bucket.config.load) {
      this.load();
    }
  }

  removeBucket(bucket: Bucket) {
    this.buckets.delete(bucket);
    if (this.buckets.size === 0) {
      this.cancel();
    }
  }

  load() {
    if (this.loaded || this.loading) return;
    Network.load(this);
    for (const bucket of this.buckets) {
      bucket.onLoading(this);
    }
  }

  onRequest() {
    this.loading = true;
    this.cached.onload = () => this.onLoaded();
    this.cached.src = this.URL;
  }

  onLoaded() {
    const config = Master.getConfig();
    this.ram =
      (this.cached.width * this.cached.height * 4 * config.COMPRESSION_RATIO) /
      UNITS[config.UNITS];
    this.loaded = true;
    this.loading = false;
    Network.onLoaded(this);
    Master.onLoaded(this);
    for (const bucket of this.buckets) {
      bucket.onLoaded(this);
    }
    if (this.shouldBlit()) {
      this.blit();
    }
  }

  cancel() {
    this.loading = false;
    this.loaded = false;
    this.cached.onload = null;
    this.cached.src = defaultURL;
    Network.onCanceled(this);
  }

  shouldBlit() {
    for (const bucket of this.buckets) {
      if (bucket.config.blit) {
        return true;
      }
    }
    return false;
  }

  blit() {
    // blit image
    this.video = this.ram / Master.getConfig().COMPRESSION_RATIO;
    this.cached.style.position = "absolute";
    this.cached.style.top = "0";
    this.cached.style.left = "0";
    this.cached.style.opacity = "0.000001";
    this.cached.width = this.cached.height = 1;
    document.body.appendChild(this.cached);
    this.rendered = true;
    Master.onBlit(this);
    for (const bucket of this.buckets) {
      bucket.onBlit(this);
    }
  }

  unblit() {
    // this.def = this.cached.cloneNode(false) as HTMLImageElement;
    // // keep default src
    // this.def.src = defaultURL;
    // this.cached.insertAdjacentElement("afterend", this.def);
    if (!this.rendered) return;
    this.rendered = false;
    this.cached.remove();
    Master.onUnblit(this);
  }

  canDelete() {
    for (const bucket of this.buckets) {
      if (bucket.config.locked) {
        return false;
      }
    }
    return true;
  }

  delete() {
    if (!this.canDelete()) return;
    Master.onDelete(this);
    this.cancel();
    this.ram = 0;
    this.video = 0;
  }

  render() {
    if (this.rendered) {
      return this.cached;
    }
    return this.def;
  }
}
