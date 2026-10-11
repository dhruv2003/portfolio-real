import { useEffect, useCallback, useRef } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { initGA, trackPageView, trackEvent } from '../utils/analytics';
import { useKonamiCode } from '../hooks/useKonamiCode';
import { CustomCursor } from './components/CustomCursor';
import { RouteTransition } from './components/RouteTransition';

const GLITCH_MS = 450;
const HACKER_MODE_MS = 10000;

const navigateTo = (to: string) => {
  router.navigate(to);
};

// Scanline sweep + jitter; `swap` runs mid-glitch so the theme change hides inside it
function glitch(swap: () => void) {
  const root = document.documentElement;
  root.classList.remove('hacker-glitch');
  void root.offsetWidth; // restart the CSS animation
  root.classList.add('hacker-glitch');
  window.setTimeout(swap, GLITCH_MS / 3);
  window.setTimeout(() => root.classList.remove('hacker-glitch'), GLITCH_MS);
}

export default function App() {
  useKonamiCode();

  const hackerTimer = useRef<number | undefined>(undefined);
  const activateHackerMode = useCallback(() => {
    const root = document.documentElement;
    trackEvent('easter_egg', { egg: 'hacker_mode' });
    if (!root.classList.contains('hacker-mode')) glitch(() => root.classList.add('hacker-mode'));
    window.clearTimeout(hackerTimer.current);
    hackerTimer.current = window.setTimeout(
      () => glitch(() => root.classList.remove('hacker-mode')),
      HACKER_MODE_MS
    );
  }, []);

  // Desktop: ~ key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') activateHackerMode();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activateHackerMode]);

  // Android: volume up + down held for 5s
  useEffect(() => {
    const pressed = new Set<string>();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const check = () => {
      if (pressed.has('VolumeUp') && pressed.has('VolumeDown')) {
        if (!timer) {
          timer = setTimeout(() => {
            activateHackerMode();
            pressed.clear();
            timer = null;
          }, 5000);
        }
      } else {
        if (timer) { clearTimeout(timer); timer = null; }
      }
    };

    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'VolumeUp' || e.key === 'VolumeDown') {
        e.preventDefault();
        pressed.add(e.key);
        check();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'VolumeUp' || e.key === 'VolumeDown') {
        pressed.delete(e.key);
        check();
      }
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      if (timer) clearTimeout(timer);
    };
  }, [activateHackerMode]);

  // Mobile: flip upside down to activate
  useEffect(() => {
    let lastFlip = 0;
    const COOLDOWN = 5000;
    const THRESHOLD = 15;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const beta = e.beta;
      if (beta === null) return;
      const isUpsideDown = Math.abs(Math.abs(beta) - 180) < THRESHOLD;
      if (isUpsideDown && Date.now() - lastFlip > COOLDOWN) {
        lastFlip = Date.now();
        activateHackerMode();
      }
    };

    const needsPermission = typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (needsPermission) {
      // iOS: wait for first touch to request permission
      const FirstTouch = async () => {
        try {
          const res = await (DeviceOrientationEvent as any).requestPermission();
          if (res === 'granted') window.addEventListener('deviceorientation', handleOrientation);
        } catch {}
        window.removeEventListener('touchstart', FirstTouch);
      };
      window.addEventListener('touchstart', FirstTouch, { once: true });
      return () => window.removeEventListener('touchstart', FirstTouch);
    } else {
      // Android: works immediately, no permission needed
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [activateHackerMode]);

  useEffect(() => {
    // Initialize Google Analytics using your exact ID
    initGA(import.meta.env.VITE_GA_MEASUREMENT_ID);
    
    // Track initial and subsequent page views automatically
    trackPageView(window.location.pathname + window.location.search);
    const unsubscribeRouter = router.subscribe((state) => {
      trackPageView(state.location.pathname + state.location.search);
    });

    const originalTitle = "Dhruv | Backend + Infrastructure";

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = "Production is down! 🔥";
      } else {
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribeRouter();
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <RouteTransition navigate={navigateTo} />
      <CustomCursor />
    </>
  );
}
