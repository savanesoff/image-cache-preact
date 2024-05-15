import { AssetPage } from "@demo/utils/assets.endpoint";
import {
  BucketProvider,
  ImageProvider,
  useBucket,
  UseBucketProps,
} from "@/components";
import { useLockerAssets } from "./useLockerAssets";

export const CacheLock = (props: UseBucketProps) => {
  // fetch all topics first page and cash it
  const { assetPages } = useLockerAssets();

  return (
    <BucketProvider name={"Lock Cache"} lock={true}>
      <AssetLocker assetPages={assetPages} {...props} />
    </BucketProvider>
  );
};

type AssetLockerProps = UseBucketProps & {
  assetPages: AssetPage[];
};
const AssetLocker = ({ assetPages, ...props }: AssetLockerProps) => {
  useBucket(props);
  return (
    <>
      {assetPages.map((page) =>
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
    </>
  );
};
