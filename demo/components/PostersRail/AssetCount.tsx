import { useBucket } from "@/components";
import { BucketEvent } from "@/lib";
import { useState, useCallback } from "react";
import { StatusBadge } from "../StatusBadge/StatusBadge";

export const AssetCount = () => {
  const [imageCount, setImageCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const onUpdate = useCallback((event: BucketEvent<"update">) => {
    setImageCount(event.images);
    setRequestCount(event.requests);
  }, []);
  useBucket({ onUpdate });
  return (
    <>
      <StatusBadge text={`I: ${imageCount}`} />
      <StatusBadge text={`R: ${requestCount}`} />
    </>
  );
};
