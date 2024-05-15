import {
  AssetPage,
  Topic,
  fetchAssets,
  fetchTopics,
} from "@demo/utils/assets.endpoint";
import { useState, useEffect } from "react";
import config from "@demo/config.json";
import { BucketProvider, ImageProvider } from "@/components";

export const CacheLock = () => {
  // fetch all topics first page and cash it
  const [topics, setTopics] = useState<Topic[]>([]);
  const [assetsPages, setAssetsPages] = useState<AssetPage[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTopics({ count: config.topics });
      setTopics(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (topics.length === 0) return;
    const fetchData = async () => {
      const assetPromises = topics.map(async (topic) => {
        const assetsPages = await fetchAssets({
          topic,
          page: 0,
        });
        return assetsPages;
      });
      const resolvedAssets = await Promise.all(assetPromises);
      setAssetsPages(resolvedAssets);
      console.log("All topics are fetched and cached", resolvedAssets);
    };

    fetchData();
  }, [topics]);

  return (
    <BucketProvider name={"Lock Cache"} lock={true}>
      {assetsPages.map((page) =>
        page.assets.map((asset) => (
          <ImageProvider
            key={asset.title}
            url={asset.url}
            type={asset.colorType}
            headers={{
              "Content-Type": asset.mimeType,
            }}
            width={120}
            height={160}
          />
        )),
      )}
    </BucketProvider>
  );
};
