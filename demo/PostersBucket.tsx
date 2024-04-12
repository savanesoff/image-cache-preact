import { BucketProvider, ProviderProps } from "@/components/Bucket";
import { PosterPage, PosterPageProps } from "./PosterPage";

export type PosterBucketProps = Exclude<ProviderProps, "children"> &
  PosterPageProps;
export const PostersBucket = ({ name, lock, ...props }: PosterBucketProps) => {
  return (
    <BucketProvider name={name} lock={lock}>
      <PosterPage {...props} />
    </BucketProvider>
  );
};
