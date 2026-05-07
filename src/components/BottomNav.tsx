import { motion } from 'framer-motion';
import { useAppState, useAppDispatch, usePendingCounts } from '../context/AppContext';
import type { TabId } from '../types';

const TABS: {
  id: TabId;
  emoji: string;
  label: string;
}[] = [
  { id: 'home', emoji: '📜', label: '奏折' },
  { id: 'economy', emoji: '🪙', label: '府库' },
  { id: 'wiki', emoji: '📔', label: '档案' },
  { id: 'profile', emoji: '☁️', label: '气象' },
];

export default function BottomNav() {
  const { currentTab } = useAppState();
  const dispatch = useAppDispatch();
  const { homeCount, economyCount } = usePendingCounts();

  const badges: Partial<Record<TabId, number>> = {
    home: homeCount,
    economy: economyCount,
  };

  return (
    <div
      className="absolute bottom-0 w-full bg-bg-elevated border-t border-line-subtle flex justify-around items-end py-2 px-2 pb-6 shadow-nav z-30 md:rounded-b-shell"
    >
      {/* Wood strip top edge */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
        style={{ background: 'var(--wood-strip)' }}
      />
      {TABS.map((tab) => {
        const active = currentTab === tab.id;
        const badgeCount = badges[tab.id] ?? 0;
        return (
          <motion.button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_TAB', tab: tab.id })}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className={`relative flex flex-col items-center gap-0.5 px-3 pt-2.5 pb-1.5 ${
              active ? 'text-ink-on-brand' : 'text-ink-muted'
            }`}
          >
            {active && (
              <>
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 rounded-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    background:
                      'linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-ink) 100%)',
                    boxShadow:
                      '0 4px 12px -2px rgba(139,46,46,0.45), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.08)',
                  }}
                />
                <motion.div
                  layoutId="bottom-nav-leaf"
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-base"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
                >
                  ✨
                </motion.div>
              </>
            )}
            <div className="relative">
              <span className={`block text-2xl leading-none ${active ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]' : 'opacity-70'}`}>
                {tab.emoji}
              </span>
              {badgeCount > 0 && !active && (
                <span
                  className="absolute -top-1 -right-2 bg-state-danger text-white text-[9px] font-black min-w-[14px] h-[14px] rounded-pill flex items-center justify-center px-0.5"
                  style={{ border: '1.5px solid var(--bg-elevated)' }}
                >
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </div>
            <span className="relative text-[10px] font-bold tracking-wide font-display mt-0.5">
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
