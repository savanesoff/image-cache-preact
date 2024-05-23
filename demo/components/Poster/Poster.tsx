import { HTMLAttributes, useEffect } from 'react';
import { useImage } from '@cache';
import { PosterLoadStatus } from './LoadStatus';
import { PosterRenderStatus } from './RenderStatus';
import { PosterImage } from './PosterImage';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { Asset } from '@demo/utils/assets.endpoint';

export type PosterProps = HTMLAttributes<HTMLDivElement> & {
  index: number;
  asset: Asset;
  pageNumber: number;
  showImmediately?: boolean;
};

/**
 * Poster component to display the image.
 * Uses the useImage hook to load the image.
 */
export const Poster = ({
  index,
  asset,
  pageNumber,
  showImmediately,
}: PosterProps) => {
  const { width, height } = useImage();
  const { ref, focused } = useFocusable();

  useEffect(() => {
    if (focused) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [focused, ref]);

  return (
    <div
      ref={ref}
      style={{
        width: width,
        height: height,
        minHeight: height,
        minWidth: width,
        maxHeight: height,
        maxWidth: width,
      }}
    >
      <PosterImage
        focused={focused}
        asset={asset}
        index={index}
        pageNumber={pageNumber}
        showImmediately={showImmediately}
      />
      <div
        className={'absolute bottom-0 flex h-4 w-full flex-row justify-between'}
      >
        <PosterLoadStatus />
        <PosterRenderStatus />
      </div>
    </div>
  );
};
