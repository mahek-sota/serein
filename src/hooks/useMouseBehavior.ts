import { useState, useEffect, useRef } from 'react';

export interface MouseState {
  x: number;
  y: number;
  speed: number;       // px/s
  intensity: number;   // 0–1 normalized
  isIdle: boolean;
  idleSeconds: number;
}

const MAX_SPEED = 1200;
const IDLE_THRESHOLD_MS = 3000;

export function useMouseBehavior(): MouseState {
  const [state, setState] = useState<MouseState>({
    x: -1, y: -1, speed: 0, intensity: 0, isIdle: false, idleSeconds: 0,
  });

  const lastPos = useRef({ x: 0, y: 0, t: Date.now() });
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const idleStart = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = (now - lastPos.current.t) / 1000;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = dt > 0 ? dist / dt : 0;

      lastPos.current = { x: e.clientX, y: e.clientY, t: now };
      idleStart.current = null;

      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        idleStart.current = Date.now();
        setState((s) => ({ ...s, isIdle: true }));
      }, IDLE_THRESHOLD_MS);

      setState((s) => ({
        ...s,
        x: e.clientX,
        y: e.clientY,
        speed,
        intensity: Math.min(speed / MAX_SPEED, 1),
        isIdle: false,
        idleSeconds: 0,
      }));
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      clearTimeout(idleTimer.current);
    };
  }, []);

  // Tick idle seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (idleStart.current !== null) {
        const secs = (Date.now() - idleStart.current) / 1000;
        setState((s) => ({ ...s, idleSeconds: secs }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
