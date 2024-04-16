import { ImageStats } from "./ImageStats";
import { RamUsage } from "./RamUsage";
import { VideoUsage } from "./VideoUsage";

export const CacheStats = () => {
  return (
    <div className="text-md flex flex-row items-center gap-2 bg-slate-800 p-2 text-slate-400">
      <div>Cache Stats</div>
      <RamUsage />
      <VideoUsage />
      <ImageStats />
    </div>
  );
};
