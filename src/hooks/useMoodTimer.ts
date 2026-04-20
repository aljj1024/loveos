import { useEffect, useState } from 'react';
import { useAppDispatch, useCurrentMood } from '../context/AppContext';

const MOOD_DURATION_MS = 24 * 60 * 60 * 1000;

export function useMoodTimer() {
  const currentMood = useCurrentMood();
  const dispatch = useAppDispatch();
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    function tick() {
      const elapsed = Date.now() - Date.parse(currentMood.setAt);
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
  }, [currentMood.setAt, dispatch]);

  return remaining;
}
