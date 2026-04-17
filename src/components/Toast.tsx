import { useEffect } from 'react';
import { useAppState, useAppDispatch } from '../context/AppContext';

export default function Toast() {
  const { toast } = useAppState();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 2500);
    return () => clearTimeout(id);
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div className="absolute top-24 left-1/2 bg-gray-900/95 backdrop-blur-sm text-white px-6 py-3.5 rounded-full text-sm font-black shadow-2xl z-50 animate-fade-in-down flex items-center justify-center text-center border border-gray-700 whitespace-nowrap max-w-[320px]">
      {toast}
    </div>
  );
}
