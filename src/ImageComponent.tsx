import { useCallback, useEffect, useState } from "react";
import { ImageItem } from "./Image";

export function CacheImage({
  image,
  defaultURL,
  style,
  ...props
}: {
  image: ImageItem;
  defaultURL: string;
  style?: React.CSSProperties;
  props?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
}) {
  const [src, setSRC] = useState(image.src() ?? defaultURL);
  const [blitListener, setBlitListener] = useState(false);

  const assignSRC = useCallback(() => {
    setSRC(image.src() ?? defaultURL);
  }, [defaultURL, image]);

  useEffect(() => {
    if (!blitListener) {
      setBlitListener(true);
      image.on("blit", () => assignSRC());
    }
    return () => {
      image.removeListener("blit", assignSRC);
    };
  }, [assignSRC, blitListener, image]);

  return <img src={src} style={style} {...props} />;
}
