import { useContext, useEffect, useState } from "react";
import { BucketContext } from "./ImageCache";

export function useBucket() {
  const bucket = useContext(BucketContext);
  //   const [, render] = useReducer(p => !p, false);
  const [_bucket, setBucket] = useState(1);
  useEffect(() => {
    if (_bucket > 1) return;
    bucket.on("change", () => setBucket(_bucket + 1));
  }, [_bucket, bucket]);
  return { ...bucket, __: _bucket };
}
