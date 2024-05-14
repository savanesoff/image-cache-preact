import { HTMLAttributes, useEffect, useState } from "react";
import { Posters } from "./Posters";
import { BucketProviderProps } from "@cache";
import { AssetPage, fetchAssets, Topic } from "@demo/utils/assets.endpoint";

export type PosterPageProps = HTMLAttributes<HTMLDivElement> &
  Exclude<BucketProviderProps, "children"> & {
    topic: Topic;
    pageNumber: number;
  };

/**
 * Component that renders a section of a poster rail (page)
 * with its load status and progress.
 */
export const PosterPage = ({
  topic,
  pageNumber,
  ...props
}: PosterPageProps) => {
  const [pageData, setPageData] = useState<AssetPage>();
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAssets({
        topic,
        page: pageNumber,
      });
      setPageData(data);
    };
    fetchData();
  }, [topic, pageNumber]);

  if (!pageData) {
    return <div>Loading...</div>;
  }
  return (
    <Posters assets={pageData.assets} width={100} height={160} {...props} />
  );
};
