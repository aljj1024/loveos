import { Bell, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAppState, useAppDispatch, useCurrentMood, usePendingCounts } from '../context/AppContext';
import { useIsHusband } from '../hooks/useIsHusband';
import { useEffectiveTier } from '../hooks/useTier';
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
  const isHusband = useIsHusband();
  const tier = useEffectiveTier();

  const profile = wikiProfiles.find((p) => p.id === currentUser);

  const prevPointsRef = useRef(points);
  const [delta, setDelta] = useState<{ amount: number; key: number } | null>(null);

  useEffect(() => {
    if (!isHusband) {
      prevPointsRef.current = points;
      return;
    }
    const diff = points - prevPointsRef.current;
    prevPointsRef.current = points;
    if (diff === 0) return;
    setDelta({ amount: diff, key: Date.now() });
    const t = setTimeout(() => setDelta(null), 1500);
    return () => clearTimeout(t);
  }, [points, isHusband]);

  function handleBell() {
    if (totalPending === 0) {
      dispatch({ type: 'SHOW_TOAST', message: '🔕 朝堂今日清净' });
      return;
    }
    // 优先跳到待办最多的那个 tab；并列时先 home（奏折）
    if (homeCount >= economyCount && homeCount > 0) {
      dispatch({ type: 'SET_TAB', tab: 'home' });
      dispatch({ type: 'SHOW_TOAST', message: `📜 ${homeCount} 件待陛下朱批` });
    } else if (economyCount > 0) {
      dispatch({ type: 'SET_TAB', tab: 'economy' });
      dispatch({ type: 'SHOW_TOAST', message: `🪙 ${economyCount} 件待陛下阅旨` });
    }
  }

  const navIconStyle = {
    background: 'rgba(255,251,240,0.18)',
    borderColor: 'rgba(255,251,240,0.35)',
    backdropFilter: 'blur(4px)',
  } as const;

  return (
    <div className="relative z-10 pt-10 pb-6 px-5 overflow-hidden">
      {/* Wood plank backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, var(--wood-edge) 0%, #4A1414 100%)',
        }}
      />
      {/* Paper noise overlay */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'var(--pattern-paper)',
          backgroundSize: 'var(--pattern-size, 220px 220px)',
          mixBlendMode: 'overlay',
        }}
      />
      {/* Wood strip at bottom edge */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-1.5 pointer-events-none"
        style={{ background: 'var(--wood-strip)' }}
      />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">🐉</span>
          <div>
            <h1
              className="text-2xl font-bold tracking-wide font-display drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
              style={{ color: '#FAF3E0' }}
            >
              {title}
            </h1>
            <p
              className="text-[11px] mt-0.5 font-medium tracking-wide"
              style={{ color: 'rgba(251,237,210,0.82)' }}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <IconButton
              ariaLabel="查看通知"
              onClick={handleBell}
              variant="soft"
              size="md"
              className="text-white border"
              style={navIconStyle}
            >
              <Bell size={18} />
            </IconButton>
            {totalPending > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 bg-state-warning text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-pill flex items-center justify-center px-1"
                style={{
                  border: '2px solid #FAF3E0',
                  boxShadow: '0 0 6px rgba(242,166,90,0.6)',
                }}
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
            className="text-white border"
            style={navIconStyle}
          >
            <LogOut size={16} />
          </IconButton>
        </div>
      </div>

      {/* 横向卷轴 nameplate：左右朱漆轴头 + 中间宣纸 */}
      <div className="relative flex items-stretch">
        {/* 左轴头 */}
        <div
          aria-hidden
          className="relative flex-shrink-0 w-2.5 rounded-l-md self-stretch"
          style={{
            background:
              'linear-gradient(180deg, #8B2E2E 0%, #4A1414 35%, #6B2323 50%, #4A1414 65%, #8B2E2E 100%)',
            boxShadow:
              'inset 0 0 0 1px #D4A645, 0 2px 6px rgba(74,20,20,0.5), inset 1px 0 1px rgba(255,255,255,0.15)',
          }}
        />
        {/* 中间宣纸内容 */}
        <div
          className="relative flex-1 p-3 flex items-center justify-between rounded-none"
          style={{
            background: 'linear-gradient(180deg, #FFFBF0 0%, #F5E8C8 100%)',
            borderTop: '1.5px solid var(--brand-accent)',
            borderBottom: '1.5px solid var(--brand-accent)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 10px rgba(0,0,0,0.12)',
          }}
        >
          {/* 内层描金细线（上） */}
          <div
            aria-hidden
            className="absolute top-1 left-3 right-3 h-px pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, #D4A645 30%, #B8862E 50%, #D4A645 70%, transparent 100%)',
              opacity: 0.55,
            }}
          />
          {/* 内层描金细线（下） */}
          <div
            aria-hidden
            className="absolute bottom-1 left-3 right-3 h-px pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, #D4A645 30%, #B8862E 50%, #D4A645 70%, transparent 100%)',
              opacity: 0.55,
            }}
          />
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="relative w-14 h-14 bg-bg-surface rounded-pill flex items-center justify-center text-3xl"
              style={{
                boxShadow:
                  '0 0 0 3px var(--wood-edge), inset 0 2px 4px rgba(0,0,0,0.06)',
              }}
            >
              {profile?.avatar ?? '👤'}
            </div>
            <div
              className={`absolute -bottom-1.5 -right-1.5 ${currentMood.current.colorClass} text-white text-[10px] px-1.5 py-0.5 rounded-pill border-2 font-bold flex items-center gap-1 whitespace-nowrap shadow-md`}
              style={{ borderColor: '#FFFBF0' }}
            >
              <span>{currentMood.current.icon}</span>
            </div>
          </div>
          <div>
            <div
              className="font-bold text-base leading-tight font-display tracking-wide"
              style={{ color: '#3D1F1F' }}
            >
              {profile?.displayName ?? '...'}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {/* 段位徽章（始终显示，倒反天罡自动互换） */}
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[11px] font-bold"
                title={
                  tier.toNext != null
                    ? `还差 ${tier.toNext} 即可晋升`
                    : '已至顶阶'
                }
                style={
                  tier.axis === 'wife'
                    ? {
                        background: '#F8D4D4',
                        color: '#8B2E2E',
                        border: '1.5px solid #D44545',
                      }
                    : {
                        background: 'linear-gradient(180deg, #F2C97D 0%, #D4A645 100%)',
                        color: '#3D1F1F',
                        border: '1.5px solid #8B6624',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                      }
                }
              >
                <span className="text-[11px] leading-none">{tier.axis === 'wife' ? '👑' : '⚔️'}</span>
                <span className="tracking-wide font-display">{tier.name}</span>
              </div>

              {/* 铜钱徽章（仅老公视角；含浮动 +X 动效） */}
              {isHusband && (
                <div
                  className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[11px] font-bold"
                  style={{
                    background: 'linear-gradient(180deg, #F2C97D 0%, #D4A645 100%)',
                    color: '#3D1F1F',
                    border: '1.5px solid #8B6624',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                  }}
                >
                  <span className="text-[11px] leading-none">🪙</span>
                  <span className="tracking-wider tabular-nums">{points}</span>
                  {delta && (
                    <span
                      key={delta.key}
                      className={`animate-points-fly absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-black pointer-events-none whitespace-nowrap ${
                        delta.amount > 0 ? 'text-state-warning' : 'text-ink-muted'
                      }`}
                    >
                      {delta.amount > 0 ? `+${delta.amount}` : delta.amount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
        {/* 右轴头 */}
        <div
          aria-hidden
          className="relative flex-shrink-0 w-2.5 rounded-r-md self-stretch"
          style={{
            background:
              'linear-gradient(180deg, #8B2E2E 0%, #4A1414 35%, #6B2323 50%, #4A1414 65%, #8B2E2E 100%)',
            boxShadow:
              'inset 0 0 0 1px #D4A645, 0 2px 6px rgba(74,20,20,0.5), inset -1px 0 1px rgba(255,255,255,0.15)',
          }}
        />
      </div>
    </div>
  );
}
