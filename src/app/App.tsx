import { useEffect, useCallback } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { initGA, trackPageView, trackEvent } from '../utils/analytics';
import { useKonamiCode } from '../hooks/useKonamiCode';

export default function App() {
  useKonamiCode();

  const activateHackerMode = useCallback(() => {
    document.documentElement.classList.add('hacker-mode');
    trackEvent('easter_egg', { egg: 'hacker_mode' });
    setTimeout(() => document.documentElement.classList.remove('hacker-mode'), 10000);
  }, []);

  // Desktop: ~ key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') activateHackerMode();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activateHackerMode]);

  // Mobile: shake to activate
  useEffect(() => {
    let lastShake = 0;
    const SHAKE_THRESHOLD = 25;
    const COOLDOWN = 3000;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;
      const total = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      if (total > SHAKE_THRESHOLD && Date.now() - lastShake > COOLDOWN) {
        lastShake = Date.now();
        activateHackerMode();
      }
    };

    // iOS 13+ requires permission
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const res = await (DeviceMotionEvent as any).requestPermission();
          if (res === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        } catch {}
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    // Request on first touch (required by iOS)
    const FirstTouch = () => {
      requestPermission();
      window.removeEventListener('touchstart', FirstTouch);
    };
    window.addEventListener('touchstart', FirstTouch, { once: true });

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('touchstart', FirstTouch);
    };
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

  return <RouterProvider router={router} />;
}
