import { AssetPage } from "@demo/utils/assets.endpoint";
import {
  BucketProvider,
  ImageProvider,
  useBucket,
  UseBucketProps,
  useImage,
  UseImageProps,
} from "@/components";
import { useLockerAssets } from "./useLockerAssets";
import { onRenderRequest } from "./onRenderRequest";
import config from "@demo/config.json";

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
            width={config.image.renderWidth}
            height={config.image.renderHeight}
          >
            <LockerImage />
          </ImageProvider>
        )),
      )}
    </>
  );
};

const LockerImage = (props?: UseImageProps) => {
  useImage({ onRender: onRenderRequest, ...props });
  return null;
};
