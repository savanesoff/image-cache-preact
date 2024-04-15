import devtoolsFPS from "devtools-fps";
import { cn } from "./utils";
import { ControllerProvider } from "@cache";

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
        ram={5} // 100GB 50GB (system) -> 50GB
        video={5} // Defragmentation -> 1GB
        units="GB"
        hwRank={0.96} // 0-1
      >
        {/* <CacheVOD /> */}
        <View />
      </ControllerProvider>
    </div>
  );
}

export default App;
