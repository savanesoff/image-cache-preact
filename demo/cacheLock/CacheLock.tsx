import { Asset, AssetPage } from "@demo/utils/assets.endpoint";
import {
  BucketProvider,
  ImageProvider,
  useBucket,
  UseBucketProps,
  useImage,
  UseImageProps,
} from "@cache";
import { useLockerAssets } from "./useLockerAssets";
import { onRenderRequest } from "./onRenderRequest";
import config from "@demo/config.json";
import { useMemo } from "react";

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
          <LockerImage key={asset.title} asset={asset} />
        )),
      )}
    </>
  );
};

type LockerImageProps = UseImageProps & {
  asset: Asset;
};
const LockerImage = ({ asset, ...props }: LockerImageProps) => {
  const headers = useMemo(() => {
    return {
      "Content-Type": asset.mimeType,
    };
  }, [asset.mimeType]);
  return (
    <ImageProvider
      key={asset.title}
      url={asset.url}
      type={asset.colorType}
      headers={headers}
      width={config.image.renderWidth}
      height={config.image.renderHeight}
    >
      <LockerImageEvents {...props} />
    </ImageProvider>
  );
};

const LockerImageEvents = (props: UseImageProps) => {
  useImage({ onRender: onRenderRequest, ...props });
  return null;
};
