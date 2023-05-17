import { useContext, useEffect, useState } from "react";
import { BucketContext } from "./BucketProvider";

export function useBucket() {
  const bucket = useContext(BucketContext);
  const [forceRender, setForceRender] = useState(-1);
  useEffect(() => {
    if (forceRender > -1) return;
    bucket.on("change", () => setForceRender(Math.random()));
  }, [forceRender, bucket]);
  return { ...bucket, __: forceRender };
}
