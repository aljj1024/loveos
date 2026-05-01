import { Bell, Trophy, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAppState, useAppDispatch, useCurrentMood, usePendingCounts } from '../context/AppContext';

interface GlobalHeaderProps {
  title: string;
  subtitle: string;
}

export default function GlobalHeader({ title, subtitle }: GlobalHeaderProps) {
  const { points, wikiProfiles, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const currentMood = useCurrentMood();
  const { homeCount, economyCount, total: totalPending } = usePendingCounts();

  const profile = wikiProfiles.find(p => p.id === currentUser);

  // Points delta animation
  const prevPointsRef = useRef(points);
  const [delta, setDelta] = useState<{ amount: number; key: number } | null>(null);

  useEffect(() => {
    const diff = points - prevPointsRef.current;
    prevPointsRef.current = points;
    if (diff === 0) return;
    setDelta({ amount: diff, key: Date.now() });
    const t = setTimeout(() => setDelta(null), 1500);
    return () => clearTimeout(t);
  }, [points]);

  function handleBell() {
    if (totalPending === 0) {
      dispatch({ type: 'SHOW_TOAST', message: '没有新通知哦~' });
      return;
    }
    const parts: string[] = [];
    if (homeCount > 0) parts.push(`${homeCount} 条待审批`);
    if (economyCount > 0) parts.push(`${economyCount} 条待处理`);
    dispatch({ type: 'SHOW_TOAST', message: `📬 ${parts.join('，')}` });
  }

  return (
    <div className="bg-gradient-to-br from-rose-400 to-pink-500 pt-10 pb-6 px-6 text-white rounded-b-[2rem] shadow-md shadow-rose-200 z-10 relative">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-black tracking-wider drop-shadow-sm">{title}</h1>
          <p className="text-rose-100 text-sm mt-1 font-medium">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="relative bg-white/20 p-2 rounded-full backdrop-blur-sm active:scale-95 transition-transform cursor-pointer"
            onClick={handleBell}
          >
            <Bell size={22} />
            {totalPending > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs text-yellow-900 font-black w-4 h-4 rounded-full flex items-center justify-center border border-pink-500">
                {totalPending > 9 ? '9+' : totalPending}
              </span>
            )}
          </div>
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            className="bg-white/20 p-2 rounded-full backdrop-blur-sm active:scale-95 transition-transform"
            title="切换身份"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/40 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
              {profile?.avatar ?? '👤'}
            </div>
            <div className={`absolute -bottom-2 -right-2 ${currentMood.current.colorClass} text-white text-[10px] px-1.5 py-0.5 rounded-full border border-white font-bold flex items-center gap-1 whitespace-nowrap`}>
              <span>{currentMood.current.icon}</span>
              <span className="hidden sm:inline">{currentMood.current.text}</span>
            </div>
          </div>
          <div className="ml-2">
            <div className="font-bold text-lg leading-tight">{profile?.displayName ?? '加载中'}</div>
            <div className="relative text-xs bg-rose-500/50 px-2 py-1 rounded-full text-rose-50 flex items-center gap-1 mt-1.5 font-medium border border-rose-400/50">
              <Trophy size={12} className="text-yellow-300" />
              金库余额: {points} 币
              {delta && (
                <span
                  key={delta.key}
                  className={`animate-points-fly absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-black pointer-events-none whitespace-nowrap ${delta.amount > 0 ? 'text-yellow-300' : 'text-rose-200'}`}
                >
                  {delta.amount > 0 ? `+${delta.amount}` : delta.amount} 积分
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
