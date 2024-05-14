import devtoolsFPS from "devtools-fps";
import { cn } from "./utils";
import { ControllerProvider } from "@cache";

import { View } from "@demo/components";

devtoolsFPS.config({
  bufferSize: 200,
  width: 200,
  height: 50,
  style: {
    // position: "fixed",
    bottom: `0`,
    right: `0`,
    zIndex: `9999`,
  },
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
        ram={3}
        video={4}
        units="GB"
        hwRank={0.8} // 0-1
        gpuDataFull={true}
      >
        {/* <CacheVOD /> */}
        <View />
      </ControllerProvider>
    </div>
  );
}

export default App;
