import devtoolsFPS from 'devtools-fps';
import { cn } from './utils';
import { ControllerProvider } from '@cache';
// import 'preact/debug';
import {
  FocusContext,
  init,
  useFocusable,
} from '@noriginmedia/norigin-spatial-navigation';
import { CacheLock } from './cacheLock';
import { useCallback, useState } from 'react';
import { CacheStats } from './components/View/CacheStats';
import { Button } from './components/Button';
import { RailsView } from './components/View/RailsView';

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
    top: '0',
    right: '0',
    zIndex: '9999',
  },
});

function App() {
  const [lockReady, setLockReady] = useState(false);
  const onCacheLockReady = useCallback(() => {
    setLockReady(true);
  }, []);

  const [showView, setShowView] = useState(false);
  const onToggleView = useCallback(() => {
    setShowView(prev => !prev);
  }, []);

  const { ref, focusKey } = useFocusable();
  return (
    <FocusContext.Provider value={focusKey}>
      <div
        ref={ref}
        className={cn('bg-slate-500', 'text-white', 'w-full', 'h-screen')}
      >
        <div
          className={cn(
            'bg-slate-900',
            'text-slate-300',
            'p-2',
            'w-full',
            'text-xl',
            'flex flex-row items-center gap-2',
          )}
        >
          <div>
            Demo:{' '}
            <a
              href={'https://github.com/savanesoff/image-cache-preact'}
              className={'text-orange-300 underline hover:text-orange-500'}
            >
              preact-image-cache
            </a>
          </div>
          <Button
            disabled={!lockReady}
            title={
              !lockReady
                ? 'loading...'
                : !showView
                  ? 'Launch Loaded View'
                  : 'Close View'
            }
            onClick={onToggleView}
            className="text-sm"
          />
          <div className="text-sm text-orange-300">
            Use your keys to navigate
          </div>
          <div className="text-4xl font-extrabold text-slate-500">
            {'\u2191\u2193\u2190\u2192 '}
          </div>
        </div>
        <ControllerProvider
          loaders={6}
          ram={2000}
          video={20}
          units="MB"
          hwRank={0.999} // 0-1
          gpuDataFull={false}
        >
          <CacheStats />

          {showView && <RailsView />}
          <CacheLock onRendered={onCacheLockReady} />
        </ControllerProvider>
      </div>
    </FocusContext.Provider>
  );
}

export default App;
