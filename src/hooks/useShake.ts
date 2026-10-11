import { useEffect, useRef } from 'react';

const THRESHOLD = 14;
const HITS_NEEDED = 3;
const HIT_GAP = 400;
const COOLDOWN = 1500;

// Fires onShake when the phone is shaken a few times in quick succession.
export function useShake(onShake: () => void, enabled = true) {
  const cb = useRef(onShake);
  cb.current = onShake;

  useEffect(() => {
    if (!enabled || typeof DeviceMotionEvent === 'undefined') return;

    let hits = 0;
    let lastHit = 0;
    let lastShake = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      let magnitude: number;
      const a = e.acceleration;
      if (a && a.x !== null) {
        magnitude = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      } else {
        const g = e.accelerationIncludingGravity;
        if (!g || g.x === null) return;
        magnitude = Math.abs(Math.hypot(g.x ?? 0, g.y ?? 0, g.z ?? 0) - 9.81);
      }

      if (magnitude < THRESHOLD) return;
      const now = Date.now();
      hits = now - lastHit < HIT_GAP ? hits + 1 : 1;
      lastHit = now;
      if (hits >= HITS_NEEDED && now - lastShake > COOLDOWN) {
        lastShake = now;
        hits = 0;
        cb.current();
      }
    };

    const needsPermission = typeof (DeviceMotionEvent as any).requestPermission === 'function';

    if (needsPermission) {
      // iOS: motion access must be requested from a user gesture
      const askOnTouch = async () => {
        try {
          const res = await (DeviceMotionEvent as any).requestPermission();
          if (res === 'granted') window.addEventListener('devicemotion', handleMotion);
        } catch {}
      };
      window.addEventListener('touchend', askOnTouch, { once: true });
      return () => {
        window.removeEventListener('touchend', askOnTouch);
        window.removeEventListener('devicemotion', handleMotion);
      };
    }

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled]);
}
