import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { Card, Badge, IconButton, EmptyState } from '../components/ui';

export default function StatsOverlay() {
  const { ledger, approvals, points, overlayPayload } = useAppState();
  const dispatch = useAppDispatch();

  const mode = (overlayPayload?.mode as string) ?? 'stats';

  const totalEarned = ledger.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const totalSpent = ledger
    .filter((e) => e.amount < 0)
    .reduce((s, e) => s + Math.abs(e.amount), 0);

  const approvalHistory = approvals.filter((a) => a.status !== 'pending');

  const statusConfig: Record<
    string,
    { label: string; tone: 'success' | 'neutral' | 'warning' }
  > = {
    approved: { label: '✅ 已准奏', tone: 'success' },
    rejected: { label: '❌ 已驳回', tone: 'neutral' },
    conditional: { label: '📎 准奏附条件', tone: 'warning' },
  };

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
          <ChevronLeft size={20} />
        </IconButton>
        <h1 className="text-lg font-bold text-ink-primary">
          {mode === 'history' ? '奏折档案' : '内帑起居注'}
        </h1>
      </div>

      <div className="px-5 py-5 space-y-5 pb-24">
        {mode === 'stats' && (
          <>
            <div className="grid grid-cols-3 gap-2.5">
              <Card padding="md" tone="surface" className="text-center">
                <div className="font-black text-2xl text-state-success">+{totalEarned}</div>
                <div className="text-xs text-ink-muted font-bold mt-1">总入帐</div>
              </Card>
              <Card padding="md" tone="surface" className="text-center">
                <div className="font-black text-2xl text-state-danger">-{totalSpent}</div>
                <div className="text-xs text-ink-muted font-bold mt-1">总耗去</div>
              </Card>
              <Card ornate padding="md" tone="surface" className="text-center">
                <div className="font-black text-2xl text-brand-ink">{points}</div>
                <div className="text-xs text-ink-muted font-bold mt-1">当前内帑</div>
              </Card>
            </div>

            <div>
              <h3 className="font-bold text-ink-primary mb-2">近期流水</h3>
              {ledger.length === 0 ? (
                <Card padding="lg" tone="surface">
                  <EmptyState icon="📭" title="尚无铜钱进出" />
                </Card>
              ) : (
                <div className="space-y-2">
                  {ledger.slice(0, 20).map((entry) => (
                    <Card
                      key={entry.id}
                      padding="md"
                      tone="surface"
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-ink-primary">
                          {entry.description}
                        </div>
                        <div className="text-xs text-ink-muted mt-0.5">
                          {new Date(entry.timestamp).toLocaleString('zh-CN', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div
                        className={`font-black text-lg ${
                          entry.amount > 0 ? 'text-state-success' : 'text-state-danger'
                        }`}
                      >
                        {entry.amount > 0 ? '+' : ''}
                        {entry.amount}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {mode === 'history' && (
          <div>
            {approvalHistory.length === 0 ? (
              <Card padding="lg" tone="surface">
                <EmptyState icon="📭" title="尚无朱批记录" />
              </Card>
            ) : (
              <div className="space-y-2.5">
                {approvalHistory.map((a) => {
                  const cfg = statusConfig[a.status];
                  return (
                    <Card key={a.id} padding="md" tone="surface">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="font-bold text-ink-primary text-sm">{a.title}</div>
                        {cfg && <Badge tone={cfg.tone}>{cfg.label}</Badge>}
                      </div>
                      <div className="text-xs text-ink-muted font-medium">{a.reason}</div>
                      {a.conditionText && (
                        <div className="mt-2 text-xs text-state-warning bg-state-warning/15 rounded-button px-3 py-1.5 font-bold">
                          圣旨附条：{a.conditionText}
                        </div>
                      )}
                      <div className="text-[11px] text-ink-muted mt-2">
                        {new Date(a.resolvedAt!).toLocaleString('zh-CN', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
