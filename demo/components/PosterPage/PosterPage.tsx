import { HTMLAttributes } from "react";
import { LoadStatus } from "./Status";
import { Progress } from "./Progress";
import { Posters } from "./Posters";

export type PosterPageProps = HTMLAttributes<HTMLDivElement> & {
  urls: string[];
};

export const PosterPage = ({ urls, ...props }: PosterPageProps) => {
  return (
    <div {...props}>
      <div>Posters View</div>
      <LoadStatus />
      <Progress />
      <Posters urls={urls} width={100} height={160} />
    </div>
  );
};
