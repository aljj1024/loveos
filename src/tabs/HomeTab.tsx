import { motion } from 'framer-motion';
import { ShoppingBag, ShieldAlert, ChevronRight, PlusCircle, ClipboardList } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import { Card, Badge, EmptyState, Button } from '../components/ui';

const statusBadge: Record<
  string,
  { label: string; tone: 'brand' | 'success' | 'warning' | 'neutral' }
> = {
  pending: { label: '待审批', tone: 'brand' },
  approved: { label: '已通过', tone: 'success' },
  rejected: { label: '已驳回', tone: 'neutral' },
  conditional: { label: '条件通过', tone: 'warning' },
};

export default function HomeTab() {
  const { approvals, vouchers, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const pendingVoucherConfirms = vouchers.filter(
    (v) => v.pendingRedemption && v.purchasedBy !== currentUser
  );

  const isWife = currentUser === 'wife';

  const incomingApprovals = approvals.filter(
    (a) => a.status === 'pending' && a.submittedBy !== 'wife'
  );
  const myApprovals = approvals.filter((a) => a.submittedBy === currentUser).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto bg-bg-base pb-24"
    >
      <GlobalHeader
        title="任务"
        subtitle={isWife ? '今天也是温柔的老婆 👑' : '今天也是努力搬砖的一天 ☀️'}
      />

      <div className="px-5 py-5">
        <h2 className="text-ink-primary font-bold mb-3 flex items-center gap-2 text-base">
          <span className="bg-brand-soft text-brand-ink p-1.5 rounded-button">✨</span>
          {isWife ? '审批中心' : '快速发起'}
        </h2>

        {isWife ? (
          <Card
            hoverable
            padding="lg"
            tone="surface"
            onClick={() =>
              dispatch({
                type: 'OPEN_OVERLAY',
                overlay: 'approvalHistory',
                payload: { mode: 'history' },
              })
            }
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-brand-soft rounded-pill flex items-center justify-center text-brand-ink">
              <ClipboardList size={22} />
            </div>
            <span className="text-sm font-bold text-ink-primary">查看所有申请记录</span>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              onClick={() =>
                dispatch({ type: 'OPEN_OVERLAY', overlay: 'form', payload: { template: 'basketball' } })
              }
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className="bg-bg-surface p-3 rounded-card shadow-card border border-line-subtle flex flex-col items-center gap-2"
            >
              <div className="w-11 h-11 bg-brand-accent-soft rounded-pill flex items-center justify-center text-2xl">
                🏀
              </div>
              <span className="text-xs font-bold text-ink-primary">打球申请</span>
            </motion.button>
            <motion.button
              onClick={() =>
                dispatch({ type: 'OPEN_OVERLAY', overlay: 'form', payload: { template: 'shopping' } })
              }
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className="bg-bg-surface p-3 rounded-card shadow-card border border-line-subtle flex flex-col items-center gap-2"
            >
              <div className="w-11 h-11 bg-state-info/15 rounded-pill flex items-center justify-center text-state-info">
                <ShoppingBag size={22} />
              </div>
              <span className="text-xs font-bold text-ink-primary">购物报备</span>
            </motion.button>
            <motion.button
              onClick={() =>
                dispatch({ type: 'OPEN_OVERLAY', overlay: 'form', payload: { template: 'truce' } })
              }
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className="bg-bg-surface p-3 rounded-card shadow-card border border-line-subtle flex flex-col items-center gap-2"
            >
              <div className="w-11 h-11 bg-state-success/15 rounded-pill flex items-center justify-center text-state-success">
                <ShieldAlert size={22} />
              </div>
              <span className="text-xs font-bold text-ink-primary">赛博休战</span>
            </motion.button>
          </div>
        )}

        {!isWife && (
          <Button
            onClick={() =>
              dispatch({ type: 'OPEN_OVERLAY', overlay: 'form', payload: { template: 'custom' } })
            }
            variant="secondary"
            fullWidth
            className="mt-3 border-2 border-dashed border-brand/40"
          >
            <PlusCircle size={16} /> 自定义申请
          </Button>
        )}
      </div>

      {pendingVoucherConfirms.length > 0 && (
        <div className="px-5 mb-2">
          <h2 className="text-ink-primary font-bold mb-3 flex items-center gap-2 text-base">
            <span className="bg-state-warning/15 text-state-warning p-1.5 rounded-button">✂️</span>
            待核销确认
          </h2>
          <div className="space-y-2">
            {pendingVoucherConfirms.map((v) => (
              <Card key={v.id} padding="md" tone="surface" className="border-state-warning/40">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{v.itemIcon}</span>
                  <div>
                    <div className="font-bold text-sm text-ink-primary">{v.itemTitle}</div>
                    <div className="text-xs text-state-warning font-bold mt-0.5">
                      对方申请核销此凭证
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    fullWidth
                    size="sm"
                    onClick={() => {
                      dispatch({ type: 'CONFIRM_VOUCHER', voucherId: v.id });
                      showToast('✅ 已确认核销！');
                    }}
                    className="bg-state-success text-white"
                  >
                    ✅ 确认核销
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      dispatch({ type: 'REJECT_VOUCHER', voucherId: v.id });
                      showToast('❌ 已拒绝核销');
                    }}
                  >
                    ❌ 拒绝
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="px-5">
        {isWife ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-ink-primary font-bold text-base">待我审批</h2>
              <button
                onClick={() =>
                  dispatch({
                    type: 'OPEN_OVERLAY',
                    overlay: 'approvalHistory',
                    payload: { mode: 'history' },
                  })
                }
                className="text-xs text-brand-ink font-bold flex items-center gap-1"
              >
                历史记录 <ChevronRight size={14} />
              </button>
            </div>

            {incomingApprovals.length === 0 ? (
              <Card padding="lg" tone="surface">
                <EmptyState
                  icon="🎉"
                  title="暂无待审批的申请"
                  description="老公今天表现不错"
                />
              </Card>
            ) : (
              <div className="space-y-2.5">
                {incomingApprovals.map((app) => (
                  <Card
                    key={app.id}
                    hoverable
                    padding="md"
                    tone="surface"
                    onClick={() =>
                      dispatch({
                        type: 'OPEN_OVERLAY',
                        overlay: 'approval',
                        payload: { approvalId: app.id },
                      })
                    }
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-brand-soft rounded-pill flex items-center justify-center text-brand-ink font-bold text-xs">
                        急
                      </div>
                      <div>
                        <h3 className="font-bold text-ink-primary text-sm">{app.title}</h3>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {new Date(app.submittedAt).toLocaleString('zh-CN', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="bg-brand text-ink-on-brand p-1.5 rounded-pill">
                      <ChevronRight size={16} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-ink-primary font-bold text-base">我的申请进度</h2>
              <button
                onClick={() =>
                  dispatch({
                    type: 'OPEN_OVERLAY',
                    overlay: 'approvalHistory',
                    payload: { mode: 'history' },
                  })
                }
                className="text-xs text-brand-ink font-bold flex items-center gap-1"
              >
                全部 <ChevronRight size={14} />
              </button>
            </div>

            {myApprovals.length === 0 ? (
              <Card padding="lg" tone="surface">
                <EmptyState
                  icon="📭"
                  title="还没有提交过申请"
                  description="用上方按钮提交一个吧"
                />
              </Card>
            ) : (
              <div className="space-y-2.5">
                {myApprovals.map((app) => {
                  const badge = statusBadge[app.status];
                  const isPending = app.status === 'pending';
                  return (
                    <Card
                      key={app.id}
                      padding="md"
                      tone="surface"
                      className={`flex items-center justify-between ${isPending ? '' : 'opacity-70'}`}
                    >
                      <div>
                        <div className="font-bold text-ink-primary text-sm">{app.title}</div>
                        <div className="text-xs text-ink-muted mt-0.5">
                          {new Date(app.submittedAt).toLocaleString('zh-CN', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {app.conditionText && (
                          <div className="text-xs text-state-warning font-bold mt-1">
                            📎 条件：{app.conditionText}
                          </div>
                        )}
                      </div>
                      <Badge tone={badge?.tone ?? 'neutral'}>{badge?.label}</Badge>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
