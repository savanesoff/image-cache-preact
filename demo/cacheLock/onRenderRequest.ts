import { RenderRequestEvent } from '@cache';

/**
 * A custom event handler for the render request.
 * Depending on the platform and the browser, its implementation will vary
 */
export const onRenderRequest = ({ target }: RenderRequestEvent<'render'>) => {
  // create div of w/h set opacity to 0.1 append to body, ren remove on next frame
  const div = document.createElement('div');
  const style = {
    width: `${target.size.width}px`,
    height: `${target.size.height}px`,
    opacity: '0.001',
    position: 'absolute',
    top: '0',
    left:
      Math.round(Math.random() * (window.innerWidth - target.size.width)) +
      'px',
    backgroundImage: `url(${target.image.url})`,
    // backgroundSize: "cover",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top left',
    pointerEvents: 'none',
    backgroundSize: `${target.size.width}px ${target.size.height}px`,
  };
  Object.assign(div.style, style);
  document.body.appendChild(div);

  target.on('clear', () => {
    document.body.removeChild(div);
  });
  return true;
};
