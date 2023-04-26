import { ImageItem } from "./Image";
import { Master } from "./master";

const loading = new Map<string, ImageItem>();
const queue = new Map<string, ImageItem>();
export const Network = {
  load(image: ImageItem) {
    if (!queue.has(image.URL)) {
      queue.set(image.URL, image);
    }
    this.update();
  },

  update() {
    if (loading.size >= Master.getConfig().LOADERS) return;
    const [url, image] = queue.entries().next().value ?? [];
    if (!url) return;
    queue.delete(url);
    loading.set(url, image);
    image.onRequest();
  },

  onLoaded(image: ImageItem) {
    loading.delete(image.URL);
    this.update();
  },

  onCanceled(image: ImageItem) {
    if (loading.has(image.URL)) {
      loading.delete(image.URL);
    }
    if (queue.has(image.URL)) {
      queue.delete(image.URL);
    }
    this.update();
  },
};
