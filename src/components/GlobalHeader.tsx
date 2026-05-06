import { Bell, Coins, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppState, useAppDispatch, useCurrentMood, usePendingCounts } from '../context/AppContext';
import { IconButton } from './ui';

interface GlobalHeaderProps {
  title: string;
  subtitle: string;
}

export default function GlobalHeader({ title, subtitle }: GlobalHeaderProps) {
  const { points, wikiProfiles, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const currentMood = useCurrentMood();
  const { homeCount, economyCount, total: totalPending } = usePendingCounts();

  const profile = wikiProfiles.find((p) => p.id === currentUser);

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
    if (homeCount > 0) parts.push(`${homeCount} 条待处理申请`);
    if (economyCount > 0) parts.push(`${economyCount} 条待处理任务`);
    dispatch({ type: 'SHOW_TOAST', message: `📬 ${parts.join('，')}` });
  }

  return (
    <div className="relative z-10 pt-10 pb-5 px-5 text-white overflow-hidden">
      {/* Layered gradient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-ink) 50%, var(--brand-accent) 100%)',
        }}
      />
      {/* Soft glow blob */}
      <div
        aria-hidden
        className="absolute -top-12 -right-10 w-44 h-44 rounded-pill -z-10 opacity-40"
        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
      />
      {/* Diagonal sheen */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          background:
            'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.25) 45%, transparent 60%)',
        }}
      />

      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block w-1 h-6 rounded-pill bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.7)]"
            />
            <h1 className="text-2xl font-black tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)]">
              {title}
            </h1>
          </div>
          <p className="text-white/90 text-xs mt-1 font-semibold tracking-wide pl-3">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <IconButton
              ariaLabel="查看通知"
              onClick={handleBell}
              variant="soft"
              size="md"
              className="bg-white/20 text-white border border-white/30 backdrop-blur-sm"
            >
              <Bell size={18} />
            </IconButton>
            {totalPending > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 bg-state-warning text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-pill flex items-center justify-center px-1 border-2 border-white"
                style={{ boxShadow: '0 0 8px rgba(251,191,36,0.7)' }}
              >
                {totalPending > 9 ? '9+' : totalPending}
              </span>
            )}
          </div>
          <IconButton
            ariaLabel="切换身份"
            onClick={() => dispatch({ type: 'LOGOUT' })}
            variant="soft"
            size="md"
            className="bg-white/20 text-white border border-white/30 backdrop-blur-sm"
          >
            <LogOut size={16} />
          </IconButton>
        </div>
      </div>

      {/* HUD card */}
      <div className="relative bg-white/15 backdrop-blur-xl rounded-card p-3 flex items-center justify-between border border-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
        <div className="flex items-center gap-3">
          {/* Avatar with conic rarity ring */}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-pill"
              style={{
                background:
                  'conic-gradient(from 0deg, #FFD700, #FBCFE8, #A78BFA, #6D4FE0, #FFD700)',
                padding: 2,
                WebkitMask:
                  'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />
            <div className="relative w-14 h-14 bg-white rounded-pill flex items-center justify-center text-3xl shadow-inner">
              {profile?.avatar ?? '👤'}
            </div>
            <div
              className={`absolute -bottom-1.5 -right-1.5 ${currentMood.current.colorClass} text-white text-[10px] px-1.5 py-0.5 rounded-pill border-2 border-white font-bold flex items-center gap-1 whitespace-nowrap shadow-md`}
            >
              <span>{currentMood.current.icon}</span>
            </div>
          </div>
          <div>
            <div className="font-black text-base leading-tight text-white tracking-wide drop-shadow-sm">
              {profile?.displayName ?? '加载中'}
            </div>
            {/* Coin chip with strong glow */}
            <div
              className="relative inline-flex items-center gap-1 mt-1.5 bg-gradient-to-b from-white/35 to-white/15 px-2.5 py-1 rounded-pill text-xs font-bold text-white border border-white/40"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.1)' }}
            >
              <Coins
                size={12}
                className="text-state-warning"
                style={{ filter: 'drop-shadow(0 0 3px rgba(251,191,36,0.8))' }}
              />
              <span className="tracking-wider">{points}</span>
              {delta && (
                <span
                  key={delta.key}
                  className={`animate-points-fly absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-black pointer-events-none whitespace-nowrap ${
                    delta.amount > 0 ? 'text-state-warning' : 'text-white/80'
                  }`}
                >
                  {delta.amount > 0 ? `+${delta.amount}` : delta.amount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
