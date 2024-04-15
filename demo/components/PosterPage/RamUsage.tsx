import { useBucket } from "@cache";
import { useCallback, useState } from "react";
import { StatusBadge } from "@demo/components";

export const RamUsage = () => {
  const [compressed, setCompressed] = useState("0");
  const [uncompressed, setUncompressed] = useState("0");
  const [total, setTotal] = useState("0");

  const { bucket } = useBucket();
  const onRequestRendered = useCallback(() => {
    const data = bucket.getBytesRam();
    setCompressed(data.compressedUnits);
    setUncompressed(data.uncompressedUnits);
    setTotal(data.totalUnits);
  }, [bucket]);
  useBucket({ onRequestRendered });
  return (
    <StatusBadge text={`RAM: c:${compressed} u:${uncompressed} t:${total}`} />
  );
};
