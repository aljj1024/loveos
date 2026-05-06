import { ScrollText, Gem, BookOpen, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppState, useAppDispatch, usePendingCounts } from '../context/AppContext';
import type { TabId } from '../types';

const TABS: {
  id: TabId;
  icon: React.FC<{ size: number; strokeWidth: number }>;
  label: string;
}[] = [
  { id: 'home', icon: ScrollText, label: '任务' },
  { id: 'economy', icon: Gem, label: '宝物' },
  { id: 'wiki', icon: BookOpen, label: '资料' },
  { id: 'profile', icon: Smile, label: '状态' },
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
    <div className="absolute bottom-0 w-full bg-bg-elevated border-t border-line-subtle flex justify-around items-end py-2 px-2 pb-6 shadow-nav z-30 md:rounded-b-shell">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = currentTab === tab.id;
        const badgeCount = badges[tab.id] ?? 0;
        return (
          <motion.button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_TAB', tab: tab.id })}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className={`relative flex flex-col items-center gap-1 px-3 pt-3 pb-1.5 ${
              active ? 'text-ink-on-brand' : 'text-ink-muted'
            }`}
          >
            {active && (
              <>
                {/* Top chevron indicator */}
                <motion.div
                  layoutId="bottom-nav-chevron"
                  className="absolute -top-1 left-1/2 -translate-x-1/2"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                >
                  <div
                    className="w-2.5 h-2.5 bg-brand rotate-45 rounded-[2px]"
                    style={{ boxShadow: '0 -2px 6px rgba(167,139,250,0.55)' }}
                  />
                </motion.div>
                {/* Active pill background w/ glow */}
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 rounded-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    background:
                      'linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-ink) 100%)',
                    boxShadow:
                      '0 6px 18px -2px rgba(167,139,250,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
                  }}
                />
              </>
            )}
            <div className="relative">
              <Icon size={active ? 24 : 22} strokeWidth={active ? 2.5 : 2} />
              {badgeCount > 0 && !active && (
                <span className="absolute -top-1 -right-1 bg-state-danger text-white text-[9px] font-black min-w-[14px] h-[14px] rounded-pill flex items-center justify-center px-0.5 border border-bg-elevated">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </div>
            <span className="relative text-[10px] font-bold tracking-wide">{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
