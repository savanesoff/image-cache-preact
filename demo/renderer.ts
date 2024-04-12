import { RenderFunctionProps } from "@/controller";

export const cacheVideo = ({ request, cb }: RenderFunctionProps) => {
  // calculate time needed to cache video, this will depend on the platform
  const timeNeeded =
    request.image.getBytesVideo(request.image.element) / 1000000;

  // create div of w/h set opacity to 0.1 append to body, ren remove on next frame
  const div = document.createElement("div");
  const style = {
    width: `${request.size.width}px`,
    height: `${request.size.height}px`,
    opacity: "0.01",
    position: "absolute",
    top: "0",
    left:
      Math.round(Math.random() * (window.innerWidth - request.size.width)) +
      "px",
    backgroundImage: `url(${request.image.url})`,
    backgroundSize: "cover",
  };
  Object.assign(div.style, style);
  document.body.appendChild(div);

  window.requestAnimationFrame(() => {
    setTimeout(() => {
      document.body.removeChild(div);
      cb();
    }, timeNeeded);
  });
  console.log(`onRenderRequest`, request);
};
