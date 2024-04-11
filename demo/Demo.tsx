import { ControllerProvider } from "@/components/Controller";
import { RenderRequest } from "@/image/render-request";
import { View } from "./View";

const onRenderRequest = (request: RenderRequest) => {
  // create div of w/h set opacity to 0.1 append to body, ren remove on next frame
  const div = document.createElement("div");
  div.style.width = `${request.size.width}px`;
  div.style.height = `${request.size.height}px`;
  div.style.opacity = "0.01";
  div.style.position = "absolute";
  div.style.top = "0";
  div.style.left = "auto";
  div.style.backgroundImage = `url(${request.image.url})`;
  div.style.backgroundSize = "cover";
  document.body.appendChild(div);
  window.requestAnimationFrame(() => {
    document.body.removeChild(div);
  });
  console.log(`onRenderRequest`, request);
};

export const Demo = () => {
  return (
    <div>
      <div>Demo</div>
      <ControllerProvider
        loaders={1}
        ram={5}
        video={5}
        units="GB"
        onRenderRequest={onRenderRequest}
      >
        <View />
      </ControllerProvider>
    </div>
  );
};
