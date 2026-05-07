import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Moon, Sun } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import {
  useAppState,
  useAppDispatch,
  useToast,
  useCurrentMood,
  useAuthState,
} from '../context/AppContext';
import { useMoodTimer } from '../hooks/useMoodTimer';
import { useIsHusband } from '../hooks/useIsHusband';
import { DEFAULT_MOODS } from '../constants';
import { Card, ConfirmModal, Button } from '../components/ui';
import { dissolveCouple, DISSOLUTION_GRACE_PERIOD_DAYS } from '../lib/supabaseDb';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function ProfileTab() {
  const { points, currentUser, wikiProfiles, flipMode } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const currentMood = useCurrentMood();
  const moodCountdown = useMoodTimer();
  const isHusband = useIsHusband();
  const [truceResult, setTruceResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [confirmingEndFlip, setConfirmingEndFlip] = useState(false);
  const [confirmingDissolve, setConfirmingDissolve] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const { coupleId, session } = useAuthState();

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

  const [stamp, setStamp] = useState<{ key: number; icon: string } | null>(null);

  function handleMoodSelect(m: typeof DEFAULT_MOODS[0]) {
    dispatch({ type: 'SET_MOOD', mood: m });
    showToast(`${m.icon} 圣意已更新，已同步给${partnerName}`);
    // 朱印盖章动画 + 震动反馈
    setStamp({ key: Date.now(), icon: m.icon });
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([15, 25, 35]); } catch { /* noop */ }
    }
    setTimeout(() => setStamp(null), 900);
  }

  async function handleDissolve() {
    if (!coupleId || !session?.user.id) {
      showToast('⚠️ 朝堂未建立，无可切断');
      setConfirmingDissolve(false);
      return;
    }
    setDissolving(true);
    try {
      await dissolveCouple(coupleId, session.user.id);
      showToast('🪦 朝堂已切断，进入宽限期');
      // 切断后强制退出登录（下次进入会重新走 CoupleSetup 流程或显示宽限期 banner）
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      dispatch({ type: 'LOGOUT' });
    } catch (e) {
      showToast(`⚠️ 切断失败：${(e as Error).message}`);
    } finally {
      setDissolving(false);
      setConfirmingDissolve(false);
    }
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
      showToast(`天意已定：${who}`);
    }, 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto bg-bg-base pb-24"
    >
      <GlobalHeader title="气象" subtitle="圣意随时同步，减少朝堂摩擦 🌤️" />

      <div className="px-5 py-5 space-y-4">
        {/* 心情选择 */}
        <Card padding="lg" tone="surface" ornate>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ink-primary font-bold font-display tracking-wide">今日圣意如何</h2>
            <div className="text-xs text-ink-muted font-medium">{moodCountdown} 自动重置</div>
          </div>
          <p className="text-xs text-ink-muted mb-3">一点即换，对方瞬时知晓</p>
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
                            '0 4px 10px -2px rgba(139,46,46,0.3), inset 0 1px 0 rgba(255,255,255,0.45)',
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
        <Card padding="lg" tone="surface" ornate>
          <h3 className="font-bold text-ink-primary mb-1 font-display tracking-wide">🏳️ 赛博休战庭</h3>
          <p className="text-xs text-ink-muted mb-3">朝中冷战？由天意定谁先认错</p>
          <Button
            onClick={handleTruce}
            disabled={isSpinning}
            fullWidth
            variant="accent"
          >
            {isSpinning ? '🎲 天意推演中...' : '一键问卦！由天意定夺 🎲'}
          </Button>
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
                <p className="text-xs text-ink-muted mt-1">天意不可抗</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* 内帑（铜钱罐） */}
        {isHusband ? (
          <Card padding="lg" tone="surface" ornate>
            <h3 className="font-bold text-ink-primary mb-3 font-display tracking-wide">🪙 朕的内帑</h3>
            <div
              className="relative overflow-hidden rounded-card p-5 border-2"
              style={{
                background:
                  'linear-gradient(160deg, #F5E8C8 0%, #D4A645 50%, #F5E8C8 100%)',
                borderColor: 'var(--wood-edge)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 20px -8px rgba(212,166,69,0.5)',
              }}
            >
              <div
                aria-hidden
                className="absolute -top-8 -right-8 w-24 h-24 rounded-pill opacity-50"
                style={{ background: 'radial-gradient(circle, rgba(255,235,170,0.6) 0%, transparent 70%)' }}
              />
              <div
                className="relative text-5xl font-black text-center tracking-wider tabular-nums"
                style={{ color: '#5C2F2F', fontFamily: 'var(--font-display)' }}
              >
                {points}
              </div>
              <div className="relative text-xs text-ink-secondary font-bold text-center mt-1 tracking-widest">
                ◆ 当前铜钱 ◆
              </div>
            </div>
            <p className="text-xs text-ink-muted mt-3">去「府库」接旨积铜钱，或在商店赎权</p>
          </Card>
        ) : (
          <Card padding="lg" tone="surface" ornate>
            <h3 className="font-bold text-ink-secondary mb-2 text-sm font-display tracking-wide">
              👀 老公的内帑
            </h3>
            <div
              className="rounded-button p-3 flex items-center justify-between"
              style={{
                background: 'var(--brand-primary-soft)',
                border: '1px dashed var(--brand-primary)',
              }}
            >
              <span className="text-2xl">🪙</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-brand-ink tabular-nums">{points}</div>
                <div className="text-[10px] text-ink-muted">皆由老婆朱批所赐</div>
              </div>
            </div>
            <p className="text-[11px] text-ink-muted mt-2">铜钱只属于老公；陛下只需颁旨与阅旨。</p>
          </Card>
        )}

        {/* 倒反天罡 · 提前结束 (仅 flipMode 时显示) */}
        <AnimatePresence>
          {flipMode && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={() => setConfirmingEndFlip(true)}
              whileTap={{ scale: 0.98, y: 1 }}
              className="relative overflow-hidden w-full rounded-card p-4 flex items-center justify-between text-left text-white"
              style={{
                background:
                  'linear-gradient(135deg, #6D4FE0 0%, #8E6BD4 50%, #C58FD8 100%)',
                boxShadow:
                  '0 8px 22px -6px rgba(109,79,224,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                }}
              />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-pill flex items-center justify-center bg-white/25 text-white text-xl">
                  ✦
                </div>
                <div>
                  <div className="text-sm font-bold font-display tracking-wide">权杖倒置中</div>
                  <div className="text-xs mt-0.5 font-semibold text-white/85">
                    点击提前归还权杖
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="relative text-white/80" />
            </motion.button>
          )}
        </AnimatePresence>

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
            <span>📊 起居注</span>
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
            <span>📜 奏折档案</span>
            <ChevronRight size={18} className="text-ink-muted" />
          </button>
          <button
            onClick={() => setConfirmingReset(true)}
            className="w-full bg-bg-surface p-4 rounded-card border border-line-subtle flex justify-between items-center text-sm font-bold text-state-danger active:bg-state-danger/10 transition-colors"
          >
            <span>🗑️ 清空朝堂</span>
            <ChevronRight size={18} className="text-state-danger/70" />
          </button>
          {coupleId && (
            <button
              onClick={() => setConfirmingDissolve(true)}
              className="w-full bg-bg-surface p-4 rounded-card border border-state-danger/30 flex justify-between items-center text-sm font-bold text-state-danger active:bg-state-danger/10 transition-colors"
            >
              <span>🪦 紧急切断朝堂</span>
              <ChevronRight size={18} className="text-state-danger/70" />
            </button>
          )}
          <p className="text-[11px] text-ink-muted leading-relaxed mt-1 px-1">
            朝堂破裂时一键冻结对方访问，{DISSOLUTION_GRACE_PERIOD_DAYS} 日宽限期后数据自动清除——温柔告别，互不为难。
          </p>
        </div>
      </div>

      {/* 重置确认 */}
      <ConfirmModal
        open={confirmingReset}
        onCancel={() => setConfirmingReset(false)}
        onConfirm={() => {
          dispatch({ type: 'RESET_APP' });
          showToast('🗑️ 朝堂已清空');
          setConfirmingReset(false);
        }}
        emoji="⚠️"
        title="确定清空全朝？"
        body={
          <>
            所有奏折、铜钱、恩诏、气象记录都会清空。<br />
            <b className="text-state-danger">此事一举不可逆。</b>
          </>
        }
        confirmLabel="清空"
        cancelLabel="再思量"
        confirmTone="danger"
      />

      {/* 提前结束倒反天罡 */}
      <ConfirmModal
        open={confirmingEndFlip}
        onCancel={() => setConfirmingEndFlip(false)}
        onConfirm={() => {
          dispatch({ type: 'TOGGLE_FLIP_MODE' });
          showToast('🌅 权杖已归还，秩序恢复');
          setConfirmingEndFlip(false);
        }}
        emoji="✦"
        title="提前归还权杖？"
        body={<>归还后秩序立刻回归，本日不再触发倒反天罡。</>}
        confirmLabel="归还"
        cancelLabel="再玩一会"
      />

      {/* 朱印盖章动画 — 心情切换时短暂浮现（戏精政务的小仪式）*/}
      <AnimatePresence>
        {stamp && (
          <motion.div
            key={stamp.key}
            aria-hidden
            initial={{ scale: 0, rotate: -18, opacity: 0 }}
            animate={{
              scale: [0, 1.15, 1, 1],
              rotate: [-18, -8, -10, -10],
              opacity: [0, 1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], times: [0, 0.35, 0.55, 1] }}
            className="absolute inset-0 z-[55] pointer-events-none flex items-center justify-center"
          >
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 132,
                height: 132,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 35% 30%, #E85959 0%, #B83333 55%, #6B2323 100%)',
                boxShadow:
                  'inset 0 0 0 4px #6B2323, inset 0 0 0 6px #D4A645, 0 8px 28px -4px rgba(139,46,46,0.55)',
                color: '#FAF6EC',
                fontSize: 56,
                lineHeight: '1',
                textShadow: '0 1px 0 rgba(0,0,0,0.25)',
              }}
            >
              <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}>
                {stamp.icon}
              </span>
              {/* 朱泥晕开 */}
              <motion.div
                className="absolute inset-[-12px] rounded-full pointer-events-none"
                initial={{ opacity: 0.5, scale: 0.6 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                style={{
                  background:
                    'radial-gradient(circle, rgba(212,69,69,0.45) 0%, rgba(139,46,46,0.0) 70%)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 紧急切断朝堂（分手友好）*/}
      <ConfirmModal
        open={confirmingDissolve}
        onCancel={() => !dissolving && setConfirmingDissolve(false)}
        onConfirm={handleDissolve}
        emoji="🪦"
        title="切断朝堂？"
        body={
          <>
            朝堂关系即刻冻结，对方失去访问权限。<br />
            <b>{DISSOLUTION_GRACE_PERIOD_DAYS} 日宽限期内</b>双方均可下载导出留存。<br />
            到期后所有奏折、铜钱、恩诏、气象记录全部自动清除。<br />
            <span className="text-state-danger">温柔告别，互不为难。</span>
          </>
        }
        confirmLabel={dissolving ? '正在切断...' : '切断朝堂'}
        cancelLabel="再思量"
        confirmTone="danger"
      />
    </motion.div>
  );
}
