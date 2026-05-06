import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Wrench, AlertOctagon } from 'lucide-react';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import { useIsApprover } from '../hooks/useEffectiveRole';
import { Card, Button, IconButton, Badge } from '../components/ui';

export default function ApprovalOverlay() {
  const { approvals, overlayPayload, wikiProfiles } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const isApprover = useIsApprover();

  const approvalId = overlayPayload?.approvalId as string;
  const approval = approvals.find((a) => a.id === approvalId);

  if (!approval) return null;

  const submitterProfile = wikiProfiles.find((p) => p.id === (approval.submittedBy ?? 'husband'));
  const submitterName = submitterProfile?.displayName ?? '老公';

  function handleApprove() {
    dispatch({ type: 'RESOLVE_APPROVAL', id: approval!.id, status: 'approved', pointsDeducted: 50 });
    dispatch({ type: 'CLOSE_OVERLAY' });
    showToast('✅ 已通过！扣除 50 金币');
  }

  function handleConditional() {
    dispatch({
      type: 'OPEN_OVERLAY',
      overlay: 'conditional',
      payload: { approvalId: approval!.id },
    });
  }

  function handleReject() {
    dispatch({ type: 'RESOLVE_APPROVAL', id: approval!.id, status: 'rejected' });
    dispatch({ type: 'CLOSE_OVERLAY' });
    showToast('⚠️ 已驳回！');
  }

  const templateEmoji: Record<string, string> = {
    basketball: '🏀',
    shopping: '🛍️',
    truce: '🏳️',
    custom: '📝',
  };

  const statusConfig: Record<
    string,
    { text: string; tone: 'success' | 'neutral' | 'warning' }
  > = {
    approved: { text: '✅ 已通过', tone: 'success' },
    rejected: { text: '❌ 已驳回', tone: 'neutral' },
    conditional: { text: '📎 条件通过', tone: 'warning' },
  };

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="absolute inset-0 z-40 bg-bg-base flex flex-col h-full overflow-y-auto"
    >
      <div className="flex-1 pb-24">
        {/* Header with brand gradient */}
        <div
          className="relative px-5 pt-10 pb-16 overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-ink) 50%, var(--brand-accent) 100%)',
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              background:
                'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
            }}
          />
          <IconButton
            ariaLabel="关闭"
            onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })}
            variant="soft"
            size="md"
            className="bg-white/25 text-white border border-white/30 backdrop-blur-sm mb-4"
          >
            <ChevronLeft size={20} />
          </IconButton>
          <h1 className="text-2xl font-black text-white tracking-wide drop-shadow-sm">
            申请详情
          </h1>
          <p className="text-white/85 text-xs mt-1 font-semibold">
            {isApprover ? '请慎重审阅，盖章后不可撤回' : `等待 ${submitterProfile?.displayName ? '审批' : '老婆审批'}中...`}
          </p>
        </div>

        <div className="px-5 -mt-12 relative z-10 space-y-4">
          <Card ornate padding="lg" tone="surface">
            <div className="flex items-center gap-3 border-b border-dashed border-line-subtle pb-3 mb-3">
              <div className="w-12 h-12 bg-brand-soft rounded-pill flex items-center justify-center text-2xl">
                {templateEmoji[approval.template] ?? '📝'}
              </div>
              <div>
                <div className="font-bold text-base text-ink-primary">{approval.title}</div>
                <div className="text-xs text-ink-muted font-medium mt-0.5">
                  {submitterName} ·{' '}
                  {new Date(approval.submittedAt).toLocaleString('zh-CN', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            <div className="text-sm space-y-1.5 font-semibold text-ink-secondary">
              <p>📝 事由：{approval.reason}</p>
              {approval.datetime && (
                <p>
                  ⏰ 时间：
                  {new Date(approval.datetime).toLocaleString('zh-CN', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>

            <div className="mt-3 bg-brand-accent-soft p-3 rounded-button border border-brand-accent">
              <span className="text-brand-ink font-bold text-xs block mb-1">✨ TA 的诚意</span>
              <span className="font-semibold text-ink-primary text-sm">{approval.sincerity}</span>
            </div>

            {approval.status !== 'pending' && statusConfig[approval.status] && (
              <div className="mt-3 flex flex-col items-center gap-1">
                <Badge tone={statusConfig[approval.status].tone} className="text-sm px-3 py-1">
                  {statusConfig[approval.status].text}
                </Badge>
                {approval.conditionText && (
                  <p className="text-xs font-semibold text-state-warning">
                    条件：{approval.conditionText}
                  </p>
                )}
              </div>
            )}
          </Card>

          {isApprover && approval.status === 'pending' && (
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                fullWidth
                size="lg"
                onClick={handleApprove}
                className="col-span-2 bg-state-success text-white"
              >
                <Heart size={18} fill="currentColor" /> 通过（扣 50 金币）
              </Button>
              <Button
                fullWidth
                size="md"
                onClick={handleConditional}
                variant="accent"
              >
                <Wrench size={16} /> 附条件通过
              </Button>
              <Button
                fullWidth
                size="md"
                onClick={handleReject}
                variant="danger"
              >
                <AlertOctagon size={16} /> 驳回
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
