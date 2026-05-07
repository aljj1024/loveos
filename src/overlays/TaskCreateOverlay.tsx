import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppDispatch, useToast } from '../context/AppContext';
import { TASK_ICONS } from '../constants';
import { useTaskRewardBaseline } from '../hooks/useTaskRewardBaseline';
import { useEffectiveRole } from '../hooks/useEffectiveRole';
import type { Task } from '../types';
import { Card, Button, Input, IconButton } from '../components/ui';

export default function TaskCreateOverlay() {
  const dispatch = useAppDispatch();
  const effectiveRole = useEffectiveRole();
  const showToast = useToast();
  const { baseline, sampleCount } = useTaskRewardBaseline();

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🧹');
  const [reward, setReward] = useState(baseline);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || reward <= 0) return;
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      icon,
      reward,
      createdBy: effectiveRole ?? 'wife',
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'CREATE_TASK', task: newTask });
    dispatch({ type: 'CLOSE_OVERLAY' });
    showToast(`📜 旨意已颁，悬赏 ${reward} 🪙`);
  }

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="absolute inset-0 z-40 bg-bg-base flex flex-col h-full overflow-y-auto"
    >
      <div className="bg-bg-elevated/85 backdrop-blur-md px-5 pt-10 pb-3 sticky top-0 z-10 border-b border-line-subtle flex items-center gap-2">
        <IconButton
          ariaLabel="关闭"
          onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })}
          variant="ghost"
          size="md"
        >
          <X size={20} />
        </IconButton>
        <h1 className="text-lg font-bold text-ink-primary font-display tracking-wide">颁发旨意 🪙</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4 pb-24">
        <Card ornate padding="lg" tone="surface" className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-2">旨意名称</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：今晚洗碗"
              required
              maxLength={24}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-2">挑选印纹</label>
            <div className="flex flex-wrap gap-2">
              {TASK_ICONS.map((i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className={`w-11 h-11 text-2xl rounded-button flex items-center justify-center transition-colors ${
                    icon === i
                      ? 'bg-brand-soft ring-2 ring-brand scale-110'
                      : 'bg-bg-base'
                  }`}
                >
                  {i}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-2">
              悬赏铜钱：<span className="text-brand-ink">{reward} 🪙</span>
            </label>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={reward}
              onChange={(e) => setReward(Number(e.target.value))}
              className="w-full accent-[var(--brand-primary)]"
            />
            <div className="flex justify-between text-[11px] text-ink-muted mt-1 font-medium">
              <span>10 🪙</span>
              <span>500 🪙</span>
            </div>
            <p className="text-[11px] text-ink-muted mt-2 leading-relaxed">
              📊 {sampleCount > 0
                ? `参考：近 ${sampleCount} 道旨意悬赏中位数 ${baseline} 🪙`
                : `尚无旨意完成记录，默认基线 ${baseline} 🪙`}
            </p>
          </div>
        </Card>

        <Card padding="md" tone="accent" className="border-brand-accent">
          <p className="text-sm font-bold text-brand-ink flex items-center gap-1.5">
            <span className="text-2xl">{icon}</span>
            <span>{title || '旨意名称'}</span>
            <span className="ml-auto inline-flex items-center gap-1">
              🪙 {reward}
            </span>
          </p>
        </Card>

        <Button type="submit" fullWidth size="lg" disabled={!title.trim() || reward <= 0}>
          颁旨 ✨
        </Button>
      </form>
    </motion.div>
  );
}
