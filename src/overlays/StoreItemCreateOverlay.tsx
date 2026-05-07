import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppDispatch, useAppState, useToast } from '../context/AppContext';
import {
  PRICE_TIERS,
  priceForTier,
  useTaskRewardBaseline,
  type PriceTierId,
} from '../hooks/useTaskRewardBaseline';
import { Button, Input, Drawer } from '../components/ui';
import type { StoreItem } from '../types';

const EMOJI_PRESETS = [
  '🎁', '🧋', '🤗', '🎤', '💆‍♂️', '🎮', '🍱', '🎬',
  '📺', '🛡️', '🗓️', '🍽️', '⌨️', '✈️', '🍰', '👜',
  '💄', '👟', '📱', '💍', '🌸', '🕯️', '🍷', '🎂',
];

const COLOR_PALETTE = [
  'bg-pink-100 text-pink-500',
  'bg-rose-100 text-rose-500',
  'bg-orange-100 text-orange-500',
  'bg-amber-100 text-amber-600',
  'bg-yellow-100 text-yellow-600',
  'bg-green-100 text-green-500',
  'bg-emerald-100 text-emerald-500',
  'bg-cyan-100 text-cyan-500',
  'bg-sky-100 text-sky-500',
  'bg-blue-100 text-blue-500',
  'bg-indigo-100 text-indigo-500',
  'bg-violet-100 text-violet-500',
  'bg-purple-100 text-purple-500',
  'bg-fuchsia-100 text-fuchsia-500',
  'bg-red-100 text-red-500',
];

export default function StoreItemCreateOverlay() {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const { currentUser } = useAppState();
  const { baseline, sampleCount } = useTaskRewardBaseline();

  const [emoji, setEmoji] = useState('🎁');
  const [title, setTitle] = useState('');
  const [tier, setTier] = useState<PriceTierId>('normal');
  // priceText kept as string so user can edit freely; derived numeric on submit
  const [priceText, setPriceText] = useState(String(priceForTier(baseline, 'normal')));
  const [touched, setTouched] = useState(false);
  const [colorClass, setColorClass] = useState(COLOR_PALETTE[0]);

  // When user picks a tier, auto-fill the price (unless they've manually edited)
  function handleTierChange(next: PriceTierId) {
    setTier(next);
    if (!touched) {
      setPriceText(String(priceForTier(baseline, next)));
    }
  }

  function handlePriceEdit(v: string) {
    setPriceText(v.replace(/[^0-9]/g, ''));
    setTouched(true);
  }

  const numericPrice = useMemo(() => {
    const n = parseInt(priceText, 10);
    return Number.isFinite(n) ? n : 0;
  }, [priceText]);

  const canSubmit = title.trim().length > 0 && numericPrice > 0;

  function close() {
    dispatch({ type: 'CLOSE_OVERLAY' });
  }

  function submit() {
    if (!canSubmit) return;
    const item: StoreItem = {
      id: `s_custom_${Date.now()}`,
      title: title.trim(),
      cost: numericPrice,
      icon: emoji,
      colorClass,
      isCustom: true,
      createdBy: currentUser ?? undefined,
    };
    dispatch({ type: 'ADD_STORE_ITEM', item });
    showToast(`✨ 新设贡品「${item.title}」`);
    close();
  }

  return (
    <Drawer open onClose={close} side="bottom" className="max-h-[90svh]">
      <div className="flex flex-col max-h-[90svh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-subtle">
          <h2 className="text-lg font-bold text-ink-primary">+ 自设贡品</h2>
          <button onClick={close} className="text-ink-muted active:scale-90 transition-transform">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Preview */}
          <div className="flex items-center justify-center">
            <div className="bg-bg-base rounded-card p-4 border border-line-subtle flex flex-col items-center gap-2 w-44">
              <div
                className={`w-16 h-16 ${colorClass} rounded-pill flex items-center justify-center text-3xl`}
                style={{
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 12px -4px rgba(212,166,69,0.4)',
                }}
              >
                {emoji}
              </div>
              <div className="font-bold text-sm text-ink-primary text-center">
                {title.trim() || '贡品名称'}
              </div>
              <div className="text-xs font-bold text-brand-ink">{numericPrice} 🪙</div>
            </div>
          </div>

          {/* Emoji picker */}
          <div>
            <label className="text-xs font-bold text-ink-muted block mb-2">图标</label>
            <div className="flex gap-1.5 flex-wrap">
              {EMOJI_PRESETS.map((e) => (
                <motion.button
                  key={e}
                  onClick={() => setEmoji(e)}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className={`w-9 h-9 text-xl rounded-button flex items-center justify-center transition-colors ${
                    emoji === e ? 'bg-brand-soft scale-110' : 'bg-bg-base'
                  }`}
                >
                  {e}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-bold text-ink-muted block mb-2">配色</label>
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setColorClass(c)}
                  className={`w-7 h-7 rounded-pill ${c.split(' ')[0]} ${
                    colorClass === c ? 'ring-2 ring-brand ring-offset-2 ring-offset-bg-elevated' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-ink-muted block mb-2">标题</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：独占周末安排权"
              maxLength={24}
            />
          </div>

          {/* Tier */}
          <div>
            <label className="text-xs font-bold text-ink-muted block mb-2">价格档位（建议）</label>
            <div className="grid grid-cols-2 gap-2">
              {PRICE_TIERS.map((t) => {
                const active = tier === t.id;
                const tierPrice = priceForTier(baseline, t.id);
                return (
                  <motion.button
                    key={t.id}
                    onClick={() => handleTierChange(t.id)}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    className={`p-3 rounded-button text-left border-2 transition-colors ${
                      active
                        ? 'bg-brand text-ink-on-brand border-transparent shadow-card'
                        : 'bg-bg-base text-ink-secondary border-line-subtle'
                    }`}
                  >
                    <div className="text-sm font-bold">{t.label}</div>
                    <div className={`text-xs mt-0.5 ${active ? 'text-white/80' : 'text-ink-muted'}`}>
                      {t.hint} · ~{tierPrice} 🪙
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Price input + baseline hint */}
          <div>
            <label className="text-xs font-bold text-ink-muted block mb-2">最终价格（可调）</label>
            <div className="relative">
              <Input
                value={priceText}
                onChange={(e) => handlePriceEdit(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]*"
                className="pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted font-bold pointer-events-none">
                🪙
              </span>
            </div>
            <p className="text-[11px] text-ink-muted mt-1.5 leading-relaxed">
              📊 {sampleCount > 0
                ? `参考：近 ${sampleCount} 道旨意悬赏中位数 ${baseline} 🪙`
                : `尚无旨意完成记录，默认基线 ${baseline} 🪙`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-line-subtle bg-bg-elevated">
          <Button variant="secondary" fullWidth onClick={close}>
            取消
          </Button>
          <Button fullWidth onClick={submit} disabled={!canSubmit}>
            颁布贡品
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
