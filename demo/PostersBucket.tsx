import { BucketProvider, BucketProviderProps } from "@cache";
import { PosterPage, PosterPageProps } from "./components/PosterPage";

export type PosterBucketProps = Exclude<BucketProviderProps, "children"> &
  PosterPageProps;
export const PostersBucket = ({ name, lock, ...props }: PosterBucketProps) => {
  return (
    <BucketProvider name={name} lock={lock}>
      <PosterPage {...props} />
    </BucketProvider>
  );
};
