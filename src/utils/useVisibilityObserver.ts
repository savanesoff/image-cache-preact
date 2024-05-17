import { useEffect, useState } from "react";
export type VisibilityObserverProps = {
  /** The ref of the element to observe */
  ref: React.RefObject<HTMLElement>;
  /**
   * The root element to use for intersection. Ex: parent Scrollable.
   * If not provided, the viewport is used.
   */
  root?: HTMLElement | null;
  /**
   * The margin around the root.
   *
   * Acts like the CSS margin property, but in the opposite direction,
   * meaning, you can push the intersection further away or pull it closer.
   *
   * If margin is set to 10px, the intersection will happen 10px before the element is visible.
   * If margin is set to -10px, the intersection will happen 10px after the element is visible.
   *
   * Can have values similar to the CSS margin property,
   * e.g.
   * ```ts
   * "10px 20px 30px 40px"; // (top, right, bottom, left)
   * ```
   */
  rootMargin?: string;
  /**
   * Either a single number or an array of numbers,
   * which indicate at what percentage of the target's visibility the observer's callback should be executed.
   *
   * If you only want to detect when visibility passes the 50% mark,
   * you can use a value of `0.5`.
   *
   * If you want the callback to run every time visibility passes another 25%,
   * you would specify the array
   *
   * ```ts
   * [0, 0.25, 0.5, 0.75, 1]
   * ```
   * in which case the callback will run at the `0%` mark, the `25%` mark,
   * the `50%` mark, the `75%` mark, and the `100%` mark.
   *
   * The default is 0 (meaning as soon as even one pixel is visible, the callback will be run).
   */
  threshold?: number | number[];
  /** Callback when the element becomes visible */
  onVisible?: () => void;
  /** Callback when the element becomes invisible */
  onInvisible?: () => void;
};

export type VisibilityObserverReturn = {
  /** Whether the element is visible */
  visible: boolean;
};

/**
 * A hook that observes the visibility of an element.
 */
export const useVisibilityObserver = ({
  ref,
  root,
  rootMargin,
  threshold = 0,
  onVisible,
  onInvisible,
}: VisibilityObserverProps) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const target = ref.current;
    if (!target) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        entry.isIntersecting && onVisible?.();
        !entry.isIntersecting && onInvisible?.();
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [ref, root, rootMargin, setVisible, onVisible, onInvisible, threshold]);
  return { visible };
};
