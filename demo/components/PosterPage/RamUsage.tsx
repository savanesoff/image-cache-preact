import { useBucket } from "@cache";
import { useCallback, useState } from "react";
import { StatusBadge } from "@demo/components";

export const RamUsage = () => {
  const [compressed, setCompressed] = useState("0");
  const [uncompressed, setUncompressed] = useState("0");
  const [total, setTotal] = useState("0");

  const { bucket } = useBucket();
  const onRequestRendered = useCallback(() => {
    const data = bucket.getRamUnits();
    setCompressed(data.compressed.toFixed(3) + data.type);
    setUncompressed(data.uncompressed.toFixed(3) + data.type);
    setTotal(data.total.toFixed(3) + data.type);
  }, [bucket]);
  useBucket({ onRequestRendered });
  return (
    <StatusBadge text={`RAM: c:${compressed} u:${uncompressed} t:${total}`} />
  );
};
