import { useEffect, useState } from 'preact/hooks';

/** width at which "desktop" is returned */
const MOBILE_BREAKPOINT = 600;

let resizeTimeout: number | undefined;

function useWindowSize() {
  const [windowSize, setWindowSize] = useState(window.innerWidth);

  function getWidth() {
    setWindowSize(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener(
      'resize',
      () => {
        resizeTimeout = window.requestAnimationFrame(getWidth);
      },
      false
    );
    return () => {
      window.cancelAnimationFrame(resizeTimeout);
    };
  }, []);

  return { isDesktop: windowSize >= MOBILE_BREAKPOINT };
}

export default useWindowSize;
