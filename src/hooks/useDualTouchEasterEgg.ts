import { useEffect, useRef, useState, type RefObject } from 'react';

type Options = {
  /** 持续按住毫秒数才触发，默认 3000 */
  holdMs?: number;
  /** 两指最小距离 (px) — 防单手误触 */
  minDistance?: number;
};

/**
 * 双指同按持续 N 秒触发的"倒反天罡"彩蛋。
 *
 * 监听 targetRef 上的 PointerEvent。当且仅当当前活跃 pointer === 2
 * 且两点距离 ≥ minDistance 时开始计时；时间内有任何 pointer 进/出
 * 都会重置进度。返回 [0, 1] 进度，可用于驱动渐显蒙层。
 */
export function useDualTouchEasterEgg(
  targetRef: RefObject<HTMLElement | null>,
  onUnlock: () => void,
  options: Options = {}
): number {
  const { holdMs = 3000, minDistance = 80 } = options;
  const [progress, setProgress] = useState(0);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const startedAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);
  const onUnlockRef = useRef(onUnlock);
  onUnlockRef.current = onUnlock;

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const cancel = () => {
      startedAtRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setProgress(0);
    };

    const tick = () => {
      if (startedAtRef.current === null) return;
      const elapsed = performance.now() - startedAtRef.current;
      const p = Math.min(1, elapsed / holdMs);
      setProgress(p);
      if (p >= 1) {
        if (!triggeredRef.current) {
          triggeredRef.current = true;
          onUnlockRef.current();
        }
        cancel();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const evaluate = () => {
      const ps = Array.from(pointersRef.current.values());
      if (ps.length !== 2) {
        cancel();
        return;
      }
      const dist = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      if (dist < minDistance) {
        cancel();
        return;
      }
      if (startedAtRef.current === null) {
        startedAtRef.current = performance.now();
        triggeredRef.current = false;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onDown = (e: PointerEvent) => {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      evaluate();
    };
    const onMove = (e: PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      // 移动期间也检查距离，太近就 cancel
      const ps = Array.from(pointersRef.current.values());
      if (ps.length === 2) {
        const dist = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
        if (dist < minDistance) cancel();
      }
    };
    const onUp = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size !== 2) cancel();
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('pointerleave', onUp);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [targetRef, holdMs, minDistance]);

  return progress;
}
