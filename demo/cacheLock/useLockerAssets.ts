import {
  Topic,
  AssetPage,
  fetchTopics,
  fetchAssets,
} from "@demo/utils/assets.endpoint";
import { useState, useEffect } from "react";
import config from "@demo/config.json";

export const useLockerAssets = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [assetPages, setAssetPages] = useState<AssetPage[]>([]);

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
        const assetPages = await fetchAssets({
          topic,
          page: 0,
        });
        return assetPages;
      });
      const resolvedAssets = await Promise.all(assetPromises);
      setAssetPages(resolvedAssets);
    };

    fetchData();
  }, [topics]);
  return { assetPages };
};
