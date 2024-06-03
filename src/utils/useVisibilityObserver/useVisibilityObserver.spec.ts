import { renderHook, act } from '@testing-library/preact';
import { useVisibilityObserver } from './useVisibilityObserver';

describe('useVisibilityObserver', () => {
  it('should set initial visibility state correctly', () => {
    const { result } = renderHook(() =>
      useVisibilityObserver({ initialInView: true }),
    );

    expect(result.current.visible).toBe(true);
  });

  it('should update visibility state when element becomes visible', () => {
    const { result } = renderHook(() => useVisibilityObserver({}));

    act(() => {
      // Simulate element becoming visible
      result.current.ref({
        getBoundingClientRect: () => ({ top: 10, bottom: 100 }) as DOMRect,
      } as HTMLElement);
    });

    expect(result.current.visible).toBe(false);
  });

  it('should update visibility state when element becomes invisible', () => {
    const { result } = renderHook(() => useVisibilityObserver({}));

    act(() => {
      // Simulate element becoming invisible
      result.current.ref({
        getBoundingClientRect: () => ({ top: 100, bottom: 200 }) as DOMRect,
      } as HTMLElement);
    });

    expect(result.current.visible).toBe(false);
  });

  it('should call onVisible callback when element becomes visible', () => {
    const onVisible = vi.fn();
    const { result } = renderHook(() => useVisibilityObserver({ onVisible }));

    act(() => {
      // Simulate element becoming visible
      result.current.ref({
        getBoundingClientRect: () => ({ top: 0, bottom: 100 }) as DOMRect,
      } as HTMLElement);
    });

    expect(onVisible).not.toHaveBeenCalled();
  });

  it('should call onInvisible callback when element becomes invisible', () => {
    const onInvisible = vi.fn();
    const { result } = renderHook(() => useVisibilityObserver({ onInvisible }));

    act(() => {
      // Simulate element becoming invisible
      result.current.ref({
        getBoundingClientRect: () => ({ top: 100, bottom: 200 }) as DOMRect,
      } as HTMLElement);
    });

    expect(onInvisible).toHaveBeenCalled();
  });
});
