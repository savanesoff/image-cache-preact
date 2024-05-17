import { cn } from "@demo/utils";
import {
  useFocusable,
  FocusContext,
} from "@noriginmedia/norigin-spatial-navigation";
import { RailsView } from "./RailsView";

/**
 * Example of an app view that uses the PostersRail component.
 * Like VOD.
 */
export const View = () => {
  const { ref, focusKey } = useFocusable();
  return (
    <FocusContext.Provider value={focusKey}>
      <div className={cn("p-4", "bg-slate-600", "w-full space-y-2")} ref={ref}>
        <RailsView />
      </div>
    </FocusContext.Provider>
  );
};
