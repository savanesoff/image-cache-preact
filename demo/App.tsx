import devtoolsFPS from "devtools-fps";
import { cn } from "./utils";
import { ControllerProvider } from "@cache";

import { View } from "@demo/components";
import { init } from "@noriginmedia/norigin-spatial-navigation";
import { CacheLock } from "./cacheLock";
import { useCallback, useState } from "react";
import { CacheStats } from "./components/View/CacheStats";

init({
  // options
  shouldFocusDOMNode: true,
  shouldUseNativeEvents: true,
  // useGetBoundingClientRect: true,
  throttle: 160,
});

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
  const [lockReady, setLockReady] = useState(false);
  const onCacheLockReady = useCallback(() => {
    setLockReady(true);
  }, []);
  return (
    <div className={cn("bg-slate-500", "text-white", "w-full", "h-screen")}>
      <div
        className={cn(
          "bg-slate-900",
          "text-slate-300",
          "p-2",
          "w-full",
          "text-xl",
        )}
      >
        React Image Cache Demo
      </div>
      <ControllerProvider
        loaders={6}
        ram={300}
        video={5000}
        units="MB"
        hwRank={0.8} // 0-1
        gpuDataFull={true}
      >
        <CacheStats />
        {lockReady && <View />}
        <CacheLock onRendered={onCacheLockReady} />
      </ControllerProvider>
    </div>
  );
}

export default App;
