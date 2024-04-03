import { Network } from "./network";

describe("Network", () => {
  let network: Network;

  beforeEach(() => {
    network = new Network();
    network.on("error", () => null);
  });

  it("should add resource to network queue", () => {
    const resource = { url: "https://example.com/resource.jpg" };
    network.pause();
    network.add(resource);
    expect(network.queue.size).toBe(1);
    expect(network.queue.get(resource.url)).toBe(resource);
  });
});
