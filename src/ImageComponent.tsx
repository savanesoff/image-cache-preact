import { useCallback, useEffect, useState } from "react";
import { CacheImage } from "./CacheImage";

export function ImageComponent({
  width,
  height,
  show,
  image,
  defaultURL,
  style,
  ...props
}: {
  width: number;
  height: number;
  show: boolean;
  image: CacheImage;
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
      image.on("unblit", () => assignSRC());
    }
    return () => {
      image.off("blit", assignSRC);
      image.off("unblit", assignSRC);
    };
  }, [assignSRC, blitListener, image]);

  useEffect(() => {
    image.setSize({ width, height });
  }, [height, image, width]);

  return (
    <img
      src={show ? src : defaultURL}
      style={style}
      width={width}
      height={height}
      {...props}
    />
  );
}
