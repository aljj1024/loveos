import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Moon, Sun } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { useAppState, useAppDispatch, useToast, useCurrentMood } from '../context/AppContext';
import { useMoodTimer } from '../hooks/useMoodTimer';
import { DEFAULT_MOODS } from '../constants';
import { Card } from '../components/ui';

export default function ProfileTab() {
  const { points, currentUser, wikiProfiles } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const currentMood = useCurrentMood();
  const moodCountdown = useMoodTimer();
  const [truceResult, setTruceResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('loveos-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const wifeProfile = wikiProfiles.find((p) => p.id === 'wife');
  const husbandProfile = wikiProfiles.find((p) => p.id === 'husband');
  const partnerName =
    currentUser === 'wife'
      ? husbandProfile?.displayName ?? '老公'
      : wifeProfile?.displayName ?? '老婆';

  const availableMoods =
    currentUser === 'husband'
      ? DEFAULT_MOODS.filter((m) => m.id !== 'period')
      : DEFAULT_MOODS;

  function handleMoodSelect(m: typeof DEFAULT_MOODS[0]) {
    dispatch({ type: 'SET_MOOD', mood: m });
    showToast(`${m.icon} 状态已更新！已同步给${partnerName}`);
  }

  function handleTruce() {
    setIsSpinning(true);
    setTruceResult(null);
    setTimeout(() => {
      const wifeName = wifeProfile?.displayName ?? '老婆';
      const husbandName = husbandProfile?.displayName ?? '老公';
      const who =
        Math.random() > 0.5 ? `${husbandName}先道歉 🙇‍♂️` : `${wifeName}先道歉 🙇‍♀️`;
      setTruceResult(who);
      setIsSpinning(false);
      showToast(`裁判结果：${who}`);
    }, 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto bg-bg-base pb-24"
    >
      <GlobalHeader title="状态" subtitle="随时更新心情，减少沟通摩擦 📡" />

      <div className="px-5 py-5 space-y-4">
        {/* 心情选择 */}
        <Card padding="lg" tone="surface">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ink-primary font-bold">今天心情如何</h2>
            <div className="text-xs text-ink-muted font-medium">{moodCountdown} 自动重置</div>
          </div>
          <p className="text-xs text-ink-muted mb-3">点击切换当前状态，对方会立即看到</p>
          <div className="grid grid-cols-2 gap-2.5">
            {availableMoods.map((m) => {
              const active = currentMood.current.id === m.id;
              return (
                <motion.button
                  key={m.id}
                  onClick={() => handleMoodSelect(m)}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                  className={`relative p-3 rounded-button text-sm font-bold flex items-center justify-center gap-2 border-2 transition-colors overflow-hidden ${
                    active
                      ? `${m.colorClass} text-white border-transparent`
                      : 'bg-bg-base border-line-subtle text-ink-secondary'
                  }`}
                  style={
                    active
                      ? {
                          boxShadow:
                            '0 6px 18px -4px rgba(167,139,250,0.4), inset 0 1px 0 rgba(255,255,255,0.45)',
                        }
                      : undefined
                  }
                >
                  <span className="text-lg">{m.icon}</span>
                  <span>{m.text}</span>
                </motion.button>
              );
            })}
          </div>
        </Card>

        {/* 赛博休战庭 */}
        <Card padding="lg" tone="surface">
          <h3 className="font-bold text-ink-primary mb-1">🏳️ 赛博休战庭</h3>
          <p className="text-xs text-ink-muted mb-3">冷战了？让命运来决定谁先认错</p>
          <motion.button
            onClick={handleTruce}
            disabled={isSpinning}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="w-full bg-gradient-to-r from-brand to-brand-accent text-white font-bold py-3 rounded-button shadow-card disabled:opacity-60"
          >
            {isSpinning ? '🎲 命运转动中...' : '一键破冰！抽签决定 🎲'}
          </motion.button>
          <AnimatePresence>
            {truceResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className="mt-3 bg-brand-accent-soft rounded-button p-4 text-center border-2 border-brand-accent"
              >
                <div className="font-bold text-base text-brand-ink">{truceResult}</div>
                <p className="text-xs text-ink-muted mt-1">裁判命令不可抗拒</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* 金币 */}
        <Card ornate padding="lg" tone="surface">
          <h3 className="font-bold text-ink-primary mb-3">💰 我的金币</h3>
          <div
            className="relative overflow-hidden bg-gradient-to-br from-brand-accent-soft via-brand-soft to-brand-accent-soft rounded-card p-4 border-2 border-brand-accent"
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 24px -8px rgba(167,139,250,0.35)',
            }}
          >
            <div
              aria-hidden
              className="absolute -top-8 -right-8 w-24 h-24 rounded-pill opacity-50"
              style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)' }}
            />
            <div className="relative text-4xl font-black text-brand-ink text-center tracking-wider drop-shadow-sm">
              {points}
            </div>
            <div className="relative text-xs text-ink-muted font-bold text-center mt-1 tracking-widest">
              ◆ 当前余额 ◆
            </div>
          </div>
          <p className="text-xs text-ink-muted mt-3">在「宝物」中接任务赚取金币，或在商店兑换特权</p>
        </Card>

        {/* Settings rows */}
        <div className="space-y-2.5">
          <button
            onClick={() => setIsDark((v) => !v)}
            className="w-full bg-bg-surface p-4 rounded-card border border-line-subtle flex justify-between items-center text-sm font-bold text-ink-primary active:bg-brand-soft/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Moon size={16} /> : <Sun size={16} />}
              {isDark ? '深色模式' : '浅色模式'}
            </span>
            <span className="text-xs text-ink-muted font-medium">点击切换</span>
          </button>
          <button
            onClick={() =>
              dispatch({ type: 'OPEN_OVERLAY', overlay: 'stats', payload: { mode: 'stats' } })
            }
            className="w-full bg-bg-surface p-4 rounded-card border border-line-subtle flex justify-between items-center text-sm font-bold text-ink-primary active:bg-brand-soft/40 transition-colors"
          >
            <span>📊 历史数据</span>
            <ChevronRight size={18} className="text-ink-muted" />
          </button>
          <button
            onClick={() =>
              dispatch({
                type: 'OPEN_OVERLAY',
                overlay: 'approvalHistory',
                payload: { mode: 'history' },
              })
            }
            className="w-full bg-bg-surface p-4 rounded-card border border-line-subtle flex justify-between items-center text-sm font-bold text-ink-primary active:bg-brand-soft/40 transition-colors"
          >
            <span>📜 历史申请记录</span>
            <ChevronRight size={18} className="text-ink-muted" />
          </button>
          <button
            onClick={() => {
              if (confirm('确定要重置所有数据吗？此操作不可撤销。')) {
                dispatch({ type: 'RESET_APP' });
                showToast('已重置所有数据');
              }
            }}
            className="w-full bg-bg-surface p-4 rounded-card border border-line-subtle flex justify-between items-center text-sm font-bold text-state-danger active:bg-state-danger/10 transition-colors"
          >
            <span>🗑️ 重置所有数据</span>
            <ChevronRight size={18} className="text-state-danger/70" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
