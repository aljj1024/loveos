import { motion } from 'framer-motion';
import { ShoppingBag, ShieldAlert, ChevronRight, PlusCircle, ClipboardList } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import { useIsApprover, useEffectiveRole } from '../hooks/useEffectiveRole';
import { Card, Badge, EmptyState, Button } from '../components/ui';
import type { Approval } from '../types';

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
  const { approvals, vouchers, currentUser, wikiProfiles } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const isApprover = useIsApprover();
  const effectiveRole = useEffectiveRole();

  const wifeName = wikiProfiles.find((p) => p.id === 'wife')?.displayName ?? '老婆';
  const husbandName = wikiProfiles.find((p) => p.id === 'husband')?.displayName ?? '老公';

  function submitterTitle(a: Approval) {
    if (a.submittedBy === 'wife') return wifeName;
    if (a.submittedBy === 'husband') return husbandName;
    return '臣';
  }

  const pendingVoucherConfirms = vouchers.filter(
    (v) => v.pendingRedemption && v.purchasedBy !== currentUser
  );

  // Approver sees pending requests submitted by the *other* effective role.
  const incomingApprovals = approvals.filter(
    (a) => a.status === 'pending' && a.submittedBy !== effectiveRole
  );
  const myApprovals = approvals.filter((a) => a.submittedBy === currentUser).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto bg-bg-base pb-24"
    >
      <GlobalHeader
        title="奏折"
        subtitle={isApprover ? '陛下今日勤政 👑' : '老公今日跪安候批 ☀️'}
      />

      <div className="px-5 py-5">
        <h2 className="text-ink-primary font-bold mb-3 flex items-center gap-2 text-base">
          <span className="bg-brand-soft text-brand-ink p-1.5 rounded-button">✨</span>
          {isApprover ? '今日朱批' : '快速上奏'}
        </h2>

        {isApprover ? (
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
            <span className="text-sm font-bold text-ink-primary">翻阅奏折档案</span>
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
              <span className="text-xs font-bold text-ink-primary">打球奏本</span>
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
              <span className="text-xs font-bold text-ink-primary">采办报禀</span>
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

        {!isApprover && (
          <Button
            onClick={() =>
              dispatch({ type: 'OPEN_OVERLAY', overlay: 'form', payload: { template: 'custom' } })
            }
            variant="secondary"
            fullWidth
            className="mt-3 border-2 border-dashed border-brand/40"
          >
            <PlusCircle size={16} /> 自拟奏折
          </Button>
        )}
      </div>

      {pendingVoucherConfirms.length > 0 && (
        <div className="px-5 mb-2">
          <h2 className="text-ink-primary font-bold mb-3 flex items-center gap-2 text-base">
            <span className="bg-state-warning/15 text-state-warning p-1.5 rounded-button">✂️</span>
            恩诏待核
          </h2>
          <div className="space-y-2">
            {pendingVoucherConfirms.map((v) => (
              <Card key={v.id} padding="md" tone="surface" className="border-state-warning/40">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{v.itemIcon}</span>
                  <div>
                    <div className="font-bold text-sm text-ink-primary">{v.itemTitle}</div>
                    <div className="text-xs text-state-warning font-bold mt-0.5">
                      对方申请核销此恩诏
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    fullWidth
                    size="sm"
                    onClick={() => {
                      dispatch({ type: 'CONFIRM_VOUCHER', voucherId: v.id });
                      showToast('✅ 已准核销');
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
                      showToast('❌ 已驳核销');
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
        {isApprover ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-ink-primary font-bold text-base">待朕朱批</h2>
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
                翻阅档案 <ChevronRight size={14} />
              </button>
            </div>

            {incomingApprovals.length === 0 ? (
              <Card padding="lg" tone="surface">
                <EmptyState
                  icon="🎉"
                  title="朝堂今日清净"
                  description="老公今日勤勉，无奏可批"
                />
              </Card>
            ) : (
              <div className="space-y-3">
                {incomingApprovals.map((app) => (
                  <motion.button
                    key={app.id}
                    onClick={() =>
                      dispatch({
                        type: 'OPEN_OVERLAY',
                        overlay: 'approval',
                        payload: { approvalId: app.id },
                      })
                    }
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                    className="relative w-full text-left rounded-card overflow-hidden"
                    style={{
                      background:
                        'linear-gradient(180deg, #FBF1C7 0%, #F2E2A4 50%, #FBF1C7 100%)',
                      boxShadow:
                        '0 6px 16px -6px rgba(139,46,46,0.3), inset 0 0 0 1px rgba(212,166,69,0.45)',
                    }}
                  >
                    {/* 顶部朱绫 + 奏字 */}
                    <div
                      className="relative flex items-center justify-between px-3 py-1.5"
                      style={{
                        background:
                          'linear-gradient(90deg, #6B2323 0%, #8B2E2E 35%, #A33636 50%, #8B2E2E 65%, #6B2323 100%)',
                        borderBottom: '1px solid #D4A645',
                        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.2)',
                      }}
                    >
                      <span
                        className="text-[11px] tracking-[0.4em] font-bold"
                        style={{
                          color: '#F5E8C8',
                          fontFamily: 'var(--font-edict)',
                          textShadow: '0 1px 0 rgba(0,0,0,0.3)',
                        }}
                      >
                        奏 ▣ 上呈陛下
                      </span>
                      <span
                        className="text-[10px] tracking-wide font-bold"
                        style={{ color: 'rgba(245,232,200,0.78)' }}
                      >
                        {new Date(app.submittedAt).toLocaleString('zh-CN', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* 黄绫纸主体 */}
                    <div className="relative px-4 pt-3 pb-3.5">
                      {/* 朱印（右下） */}
                      <div
                        aria-hidden
                        className="absolute bottom-2 right-3 w-11 h-11 flex items-center justify-center rotate-[-7deg] pointer-events-none select-none"
                        style={{
                          background:
                            'radial-gradient(circle at 35% 30%, #E85959 0%, #B83333 60%, #6B2323 100%)',
                          color: '#FAF6EC',
                          fontFamily: 'var(--font-edict)',
                          fontSize: 10,
                          fontWeight: 800,
                          lineHeight: 1.1,
                          letterSpacing: '0.05em',
                          textAlign: 'center',
                          borderRadius: 4,
                          boxShadow:
                            'inset 0 0 0 1.5px #6B2323, inset 0 0 0 3px #B83333, 0 1px 3px rgba(0,0,0,0.25)',
                          textShadow: '0 1px 0 rgba(0,0,0,0.3)',
                        }}
                      >
                        臣<br />印
                      </div>

                      <h3
                        className="font-bold text-ink-primary text-base leading-snug pr-12"
                        style={{
                          fontFamily: 'var(--font-edict)',
                          color: '#3D1F1F',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {app.title}
                      </h3>
                      <p
                        className="text-[12px] mt-1.5 pr-12"
                        style={{
                          color: '#6B4F23',
                          fontFamily: 'var(--font-edict)',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {submitterTitle(app)}谨奏，伏候圣裁。
                      </p>
                    </div>

                    {/* 底部描金细线 */}
                    <div
                      aria-hidden
                      className="h-1 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent 0%, #D4A645 30%, #B8862E 50%, #D4A645 70%, transparent 100%)',
                      }}
                    />
                    {/* 右侧 chevron 提示 */}
                    <ChevronRight
                      aria-hidden
                      size={14}
                      className="absolute top-1/2 right-1 -translate-y-1/2 opacity-40"
                      style={{ color: '#6B2323' }}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-ink-primary font-bold text-base">朕的奏本进度</h2>
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
                  title="尚无奏本"
                  description="用上方按钮递一道吧"
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
                            📎 圣旨附条件：{app.conditionText}
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
