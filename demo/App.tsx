import devtoolsFPS from "devtools-fps";
import { cn } from "./utils";
import { ControllerProvider } from "@cache";

import { View } from "@demo/components";
import {
  FocusContext,
  init,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import { CacheLock } from "./cacheLock";
import { useCallback, useState } from "react";
import { CacheStats } from "./components/View/CacheStats";
import { Button } from "./components/Button";

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

  const [showView, setShowView] = useState(false);
  const onToggleView = useCallback(() => {
    setShowView((prev) => !prev);
  }, []);

  const { ref, focusKey } = useFocusable();
  return (
    <FocusContext.Provider value={focusKey}>
      <div
        ref={ref}
        className={cn("bg-slate-500", "text-white", "w-full", "h-screen")}
      >
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
          <Button
            disabled={!lockReady}
            title={
              !lockReady
                ? "loading..."
                : !showView
                  ? "Launch View"
                  : "Close View"
            }
            onClick={onToggleView}
            className="text-sm"
          />
        </div>
        <ControllerProvider
          loaders={6}
          ram={50000}
          video={30000}
          units="MB"
          hwRank={0.8} // 0-1
          gpuDataFull={true}
        >
          <CacheStats />

          {showView && <View />}
          <CacheLock onRendered={onCacheLockReady} />
        </ControllerProvider>
      </div>
    </FocusContext.Provider>
  );
}

export default App;
