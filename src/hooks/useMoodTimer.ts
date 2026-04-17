import { useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../context/AppContext';

const MOOD_DURATION_MS = 24 * 60 * 60 * 1000;

export function useMoodTimer() {
  const { mood } = useAppState();
  const dispatch = useAppDispatch();
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    function tick() {
      const elapsed = Date.now() - Date.parse(mood.setAt);
      const left = MOOD_DURATION_MS - elapsed;
      if (left <= 0) {
        dispatch({ type: 'RESET_MOOD' });
        setRemaining('已重置');
        return;
      }
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      setRemaining(`还剩 ${h}小时 ${m}分钟`);
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [mood.setAt, dispatch]);

  return remaining;
}
