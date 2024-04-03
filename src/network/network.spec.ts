import { Network } from "./network";
const url = () => Math.random().toString(36).substring(7);
describe("Network", () => {
  let network: Network;

  beforeEach(() => {
    network = new Network({ loaders: 1 });
    network.on("error", () => null);
  });

  it("should add resource to loaders", () => {
    const resource = { url: url() };
    network.add(resource);
    expect(network.loaders.size).toBe(1);
    expect(network.loaders.get(resource.url)).toBeDefined();
  });

  it("should not add the same resource twice", () => {
    const resource = { url: url() };
    network.add(resource);
    network.add(resource);
    expect(network.loaders.size).toBe(1);
  });

  it("should not have loading resource in queue", () => {
    const resource = { url: url() };
    network.add(resource);
    expect(network.queue.size).toBe(0);
  });

  it("should remove resource from loaders on load", () => {
    const resource = { url: url() };
    network.add(resource);
    network.loaders.get(resource.url)?.emit("loadend");
    expect(network.loaders.size).toBe(0);
  });

  it("should remove resource from loaders on abort", () => {
    const resource = { url: url() };
    network.add(resource);
    network.loaders.get(resource.url)?.emit("abort");
    expect(network.loaders.size).toBe(0);
  });

  it("should remove resource from loaders on error", () => {
    const resource = { url: url() };
    network.add(resource);
    network.loaders.get(resource.url)?.emit("error");
    expect(network.loaders.size).toBe(0);
  });

  it("should remove resource from loaders on timeout", () => {
    const resource = { url: url() };
    network.add(resource);
    network.loaders.get(resource.url)?.emit("timeout");
    expect(network.loaders.size).toBe(0);
  });

  it("should add resource to queue if loaders are full", () => {
    network.add({ url: url() });
    network.add({ url: url() });
    expect(network.queue.size).toBe(1);
  });

  it("should not add resource to loaders if paused", () => {
    network.pause();
    network.add({ url: url() });
    expect(network.loaders.size).toBe(0);
  });

  it("should not process resource if paused", () => {
    network.pause();
    network.add({ url: url() });
    expect(network.queue.size).toBe(1);
  });

  it("should take resource from queue when unpaused", () => {
    network.pause();
    network.add({ url: url() });
    network.resume();
    expect(network.queue.size).toBe(0);
  });

  it("should take resource from queue when loader is removed", () => {
    network.add({ url: url() });
    network.add({ url: url() });
    network.loaders.get([...network.loaders.keys()][0])?.emit("loadend");
    expect(network.queue.size).toBe(0);
  });

  it("should remove all loaders on clear", () => {
    network.add({ url: url() });
    network.clear();
    expect(network.loaders.size).toBe(0);
  });

  it("should remove loaders on pause", () => {
    network.add({ url: url() });
    network.pause();
    expect(network.loaders.size).toBe(1);
  });

  it("should remove all loaders on clear", () => {
    network.add({ url: url() });
    network.clear();
    expect(network.loaders.size).toBe(0);
  });

  it("should empty queue on clear", () => {
    network.add({ url: url() });
    network.add({ url: url() });
    network.add({ url: url() });
    network.clear();
    expect(network.queue.size).toBe(0);
  });

  it("should emit pause event", () => {
    const spy = vi.fn();
    network.on("pause", spy);
    network.pause();
    expect(spy).toHaveBeenCalledWith(network, undefined);
  });

  it("should emit resume event", () => {
    const spy = vi.fn();
    network.on("resume", spy);
    network.resume();
    expect(spy).toHaveBeenCalledWith(network, undefined);
  });

  it("should emit error event", () => {
    const spy = vi.fn();
    network.on("error", spy);
    const resource = { url: url() };
    network.add(resource);
    const loader = network.loaders.get(resource.url);
    loader?.emit("error");
    expect(spy).toHaveBeenCalledWith(network, loader);
  });

  it("should emit abort event", () => {
    const spy = vi.fn();
    network.on("abort", spy);
    const resource = { url: url() };
    network.add(resource);
    const loader = network.loaders.get(resource.url);
    loader?.emit("abort");
    expect(spy).toHaveBeenCalledWith(network, loader);
  });

  it("should emit timeout event", () => {
    const spy = vi.fn();
    network.on("timeout", spy);
    const resource = { url: url() };
    network.add(resource);
    const loader = network.loaders.get(resource.url);
    loader?.emit("timeout");
    expect(spy).toHaveBeenCalledWith(network, loader);
  });
});
