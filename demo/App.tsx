import devtoolsFPS from "devtools-fps";
import { cn } from "@/utils";
import { ControllerProvider } from "@/components/Controller";
import { cacheVideo } from "./renderer";
import { View } from "./View";

devtoolsFPS.config({
  bufferSize: window.innerWidth,
  width: window.innerWidth,
  height: 140,
});

function App() {
  return (
    <div className={cn("bg-slate-500", "text-white", "w-full", "h-screen")}>
      <div
        className={cn(
          "bg-slate-900",
          "text-slate-300",
          "p-4",
          "w-full",
          "text-2xl",
        )}
      >
        React Image Cache Demo
      </div>
      <ControllerProvider
        loaders={6}
        ram={5}
        video={5}
        units="GB"
        onRenderRequest={cacheVideo}
      >
        <View />
      </ControllerProvider>
    </div>
  );
}

export default App;
