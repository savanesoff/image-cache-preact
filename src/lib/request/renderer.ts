import { RenderRequest } from "./render-request";

export const renderer = ({
  request,
  renderTime,
}: {
  request: RenderRequest;
  renderTime: number;
}) => {
  // create div of w/h set opacity to 0.1 append to body, ren remove on next frame
  const div = document.createElement("div");
  const style = {
    width: `${request.size.width}px`,
    height: `${request.size.height}px`,
    opacity: "0.001",
    position: "absolute",
    top: "0",
    left:
      Math.round(Math.random() * (window.innerWidth - request.size.width)) +
      "px",
    backgroundImage: `url(${request.image.url})`,
    // backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "top left",
    pointerEvents: "none",
    backgroundSize: `${request.size.width}px ${request.size.height}px`,
  };
  Object.assign(div.style, style);
  document.body.appendChild(div);

  setTimeout(() => {
    document.body.removeChild(div);
  }, renderTime);
};
