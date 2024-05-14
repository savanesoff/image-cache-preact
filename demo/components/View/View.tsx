import { cn } from "@demo/utils";
import { PostersRail } from "@demo/components";
import { CacheStats } from "./CacheStats";
import { useEffect, useState } from "react";
import {
  useFocusable,
  FocusContext,
} from "@noriginmedia/norigin-spatial-navigation";
import { fetchTopics, Topic } from "@demo/utils/assets.endpoint";
import config from "@demo/config.json";

/**
 * Example of an app view that uses the PostersRail component.
 * Like VOD.
 */
export const View = () => {
  const { ref, focusKey } = useFocusable();

  return (
    <FocusContext.Provider value={focusKey}>
      <div className={cn("p-4", "bg-slate-600", "w-full space-y-2")} ref={ref}>
        <CacheStats />
        <Rails />
      </div>
    </FocusContext.Provider>
  );
};

const Rails = () => {
  const [data, setData] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTopics({ count: config.topics });
      setData(data);
    };
    fetchData();
  }, []);

  return (
    <>
      {data.length === 0 && <div>Loading...</div>}
      {data.map((topic) => (
        <PostersRail
          key={topic.id}
          topic={topic}
          fromPage={0}
          assetCount={config.perPage}
        />
      ))}
    </>
  );
};

// const ToggleRail = () => {
//   const [hidden, setHidden] = useState(true);
//   const toggleRail = useCallback(() => setHidden((hidden) => !hidden), []);
//   return (
//     <div className="mt-2 flex flex-col items-start gap-2">
//       <button className="rounded-md bg-blue-400 p-1 " onClick={toggleRail}>
//         Toggle Rail
//       </button>
//       {!hidden && <PostersRail />}
//     </div>
//   );
// };
