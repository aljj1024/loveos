import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, HeartHandshake } from 'lucide-react';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import { APPROVAL_TEMPLATES } from '../constants';
import type { Approval, ApprovalTemplate } from '../types';
import { Card, Button, Input, Textarea, IconButton } from '../components/ui';

const templateMeta: Record<ApprovalTemplate, { emoji: string; label: string }> = {
  basketball: { emoji: '🏀', label: '打球奏本' },
  shopping: { emoji: '🛍️', label: '采办报禀' },
  truce: { emoji: '🏳️', label: '赛博休战' },
  custom: { emoji: '📝', label: '自拟奏折' },
};

export default function FormOverlay() {
  const { overlayPayload } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const template = (overlayPayload?.template as ApprovalTemplate) ?? 'custom';
  const defaults = APPROVAL_TEMPLATES[template];
  const meta = templateMeta[template];

  const [reason, setReason] = useState(defaults.reason);
  const [datetime, setDatetime] = useState(defaults.datetime);
  const [sincerity, setSincerity] = useState(defaults.sincerity);
  const [title, setTitle] = useState(defaults.title);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const approval: Approval = {
      id: `approval_${Date.now()}`,
      template,
      title: title || reason,
      reason,
      datetime,
      sincerity,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    dispatch({ type: 'SUBMIT_APPROVAL', approval });
    dispatch({ type: 'CLOSE_OVERLAY' });
    showToast('🚀 奏本已递，恭候朱批');
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
        <h1 className="text-lg font-bold text-ink-primary">
          <span className="mr-1">{meta.emoji}</span>
          起草奏折 · {meta.label}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4 pb-24">
        <Card ornate padding="lg" tone="surface" className="space-y-4">
          {template === 'custom' && (
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-2">
                奏本标题
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：周末外出打球"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-2">启奏</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="禀报具体缘由..."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-2">时辰</label>
            <Input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
            />
          </div>
        </Card>

        <Card padding="lg" tone="accent" className="border-brand-accent">
          <label className="flex items-center gap-1.5 text-sm font-bold text-brand-ink mb-2">
            <HeartHandshake size={16} /> 臣的诚意（保命必填）
          </label>
          <Textarea
            rows={3}
            value={sincerity}
            onChange={(e) => setSincerity(e.target.value)}
            placeholder="许些甜头，提高准奏率..."
            required
          />
        </Card>

        <Button type="submit" fullWidth size="lg">
          递呈奏本 📮
        </Button>
      </form>
    </motion.div>
  );
}
