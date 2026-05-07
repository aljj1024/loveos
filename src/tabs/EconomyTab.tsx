import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, CheckCircle2, Clock, Trophy, X } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import { useIsHusband } from '../hooks/useIsHusband';
import { useIsApprover } from '../hooks/useEffectiveRole';
import type { StoreItem, Voucher } from '../types';
import { Card, Badge, Button, Tab, EmptyState, ConfirmModal } from '../components/ui';

type EcoMode = 'tasks' | 'store';

export default function EconomyTab() {
  const { tasks, storeItems, vouchers, points, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const isHusband = useIsHusband();
  const isApprover = useIsApprover();
  const [ecoMode, setEcoMode] = useState<EcoMode>('tasks');
  const [confirmingBuy, setConfirmingBuy] = useState<StoreItem | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<StoreItem | null>(null);

  const myActiveTasks = tasks.filter(
    (t) => t.acceptedBy === currentUser && t.status === 'accepted'
  );
  const pendingVerifyByMe = tasks.filter(
    (t) => t.createdBy === currentUser && t.status === 'pending_verify'
  );
  const openTasks = tasks.filter((t) => t.status === 'open' && t.createdBy !== currentUser);
  const doneTasks = tasks.filter((t) => t.status === 'verified').slice(0, 3);

  function handleAccept(taskId: string, reward: number) {
    dispatch({ type: 'ACCEPT_TASK', taskId });
    showToast(`✅ 已接旨！完工后获 ${reward} 🪙`);
  }

  function handleComplete(taskId: string) {
    dispatch({ type: 'COMPLETE_TASK', taskId });
    showToast('📤 已复命，待陛下阅旨');
  }

  function handleVerify(taskId: string, reward: number) {
    dispatch({ type: 'VERIFY_TASK', taskId });
    showToast(`🎉 阅旨通过！+${reward} 🪙 已入库`);
  }

  function performBuy(item: StoreItem) {
    if (points < item.cost) {
      showToast('❌ 钱袋空空，接旨任务方可补给');
      return;
    }
    const voucher: Voucher = {
      id: `voucher_${Date.now()}`,
      itemId: item.id,
      itemTitle: item.title,
      itemIcon: item.icon,
      purchasedAt: new Date().toISOString(),
      purchasedBy: currentUser ?? undefined,
      isRedeemed: false,
      pendingRedemption: false,
    };
    dispatch({ type: 'BUY_ITEM', itemId: item.id, voucher });
    dispatch({ type: 'OPEN_OVERLAY', overlay: 'voucher', payload: { voucherId: voucher.id } });
    showToast(`🎁 已得「${item.title}」恩诏`);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto bg-bg-base pb-24"
    >
      <GlobalHeader
        title="府库"
        subtitle={
          isApprover
            ? '颁布旨意，老公接旨听差 💪'
            : '多接旨意多积铜钱，攒够便可兑用 🪙'
        }
      />

      <div className="px-5 py-4 flex justify-center">
        <Tab<EcoMode>
          items={[
            { id: 'tasks', label: '📋 旨意广场' },
            { id: 'store', label: '🪙 贡品商店' },
          ]}
          value={ecoMode}
          onChange={setEcoMode}
          layoutId="economy-mode"
        />
      </div>

      {ecoMode === 'tasks' && (
        <div className="px-5 space-y-4">
          {isApprover && (
            <Button
              onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'taskCreate' })}
              variant="secondary"
              fullWidth
              className="border-2 border-dashed border-brand/40"
            >
              <PlusCircle size={18} /> 颁发旨意
            </Button>
          )}

          {myActiveTasks.length > 0 && (
            <section>
              <h3 className="font-bold text-ink-secondary text-sm mb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-state-info" /> 已接旨意
              </h3>
              <div className="space-y-2.5">
                {myActiveTasks.map((task) => (
                  <Card
                    key={task.id}
                    padding="md"
                    tone="surface"
                    className="border-state-info/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{task.icon}</div>
                      <div>
                        <div className="font-bold text-ink-primary text-sm">{task.title}</div>
                        <div className="text-xs text-state-warning font-bold mt-1 flex items-center gap-1">
                          🪙 +{task.reward}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleComplete(task.id)} variant="accent">
                      复命交差
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {pendingVerifyByMe.length > 0 && (
            <section>
              <h3 className="font-bold text-ink-secondary text-sm mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-state-warning" /> 待朕阅旨
              </h3>
              <div className="space-y-2.5">
                {pendingVerifyByMe.map((task) => (
                  <Card
                    key={task.id}
                    padding="md"
                    tone="surface"
                    className="border-state-warning/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{task.icon}</div>
                      <div>
                        <div className="font-bold text-ink-primary text-sm">{task.title}</div>
                        <div className="text-xs text-state-warning font-bold mt-1 flex items-center gap-1">
                          🪙 +{task.reward}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleVerify(task.id, task.reward)}
                        variant="primary"
                      >
                        ✅ 准奏
                      </Button>
                      <span className="text-[10px] text-state-warning font-bold">待阅旨</span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {openTasks.length > 0 && (
            <section>
              <h3 className="font-bold text-ink-secondary text-sm mb-2 flex items-center gap-1.5">
                🪙 待领旨意
              </h3>
              <div className="space-y-2.5">
                {openTasks.map((task) => (
                  <Card
                    key={task.id}
                    hoverable
                    padding="md"
                    tone="surface"
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{task.icon}</div>
                      <div>
                        <div className="font-bold text-ink-primary text-sm">{task.title}</div>
                        {task.sourceApprovalId && (
                          <div className="text-[11px] text-state-warning font-bold mt-0.5">
                            📎 圣旨附条件
                          </div>
                        )}
                        <div className="text-xs text-state-warning font-bold mt-1 flex items-center gap-1">
                          🪙 +{task.reward}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAccept(task.id, task.reward)}>
                      接旨
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {openTasks.length === 0 &&
            myActiveTasks.length === 0 &&
            pendingVerifyByMe.length === 0 && (
              <Card padding="lg" tone="surface">
                <EmptyState
                  icon="📜"
                  title={isApprover ? '朝堂清净，无事可禀' : '万事已毕，请陛下颁旨'}
                  description={
                    isApprover
                      ? '颁布新旨，老公听差'
                      : '静候新旨颁布'
                  }
                />
              </Card>
            )}

          {doneTasks.length > 0 && (
            <section className="opacity-60">
              <h3 className="font-bold text-ink-muted text-sm mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-state-success" /> 已结案
              </h3>
              <div className="space-y-1.5">
                {doneTasks.map((task) => (
                  <Card
                    key={task.id}
                    padding="sm"
                    tone="soft"
                    bordered={false}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{task.icon}</span>
                      <span className="text-sm font-bold text-ink-secondary">{task.title}</span>
                    </div>
                    <span className="text-xs text-state-success font-bold">+{task.reward}</span>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {ecoMode === 'store' && (
        <div className="px-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {storeItems.map((item) => (
              <Card
                key={item.id}
                ornate
                hoverable
                padding="md"
                tone="surface"
                className="relative flex flex-col items-center text-center"
              >
                {item.isCustom && isApprover && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmingDelete(item);
                    }}
                    aria-label={`删除 ${item.title}`}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-pill bg-bg-base/90 text-ink-muted flex items-center justify-center active:scale-90 transition-transform z-10 hover:text-state-danger"
                  >
                    <X size={12} />
                  </button>
                )}
                <div
                  className={`w-14 h-14 ${item.colorClass} rounded-pill flex items-center justify-center mb-2.5 text-2xl`}
                  style={{
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 10px -4px rgba(139,46,46,0.3)',
                  }}
                >
                  {item.icon}
                </div>
                <div className="font-bold text-ink-primary text-sm mb-1 line-clamp-1">{item.title}</div>
                <div className="text-xs font-bold text-brand-ink mb-3 flex items-center gap-1">
                  🪙 {item.cost}
                </div>
                {isHusband ? (
                  <Button
                    size="sm"
                    fullWidth
                    variant={points >= item.cost ? 'accent' : 'secondary'}
                    disabled={points < item.cost}
                    onClick={() => setConfirmingBuy(item)}
                  >
                    {points >= item.cost ? '兑用 🪙' : '钱袋不足'}
                  </Button>
                ) : (
                  <div
                    className="w-full text-[11px] font-bold text-center py-2 rounded-button"
                    style={{
                      background: 'var(--brand-primary-soft)',
                      color: 'var(--brand-ink)',
                      border: '1px dashed var(--brand-primary)',
                    }}
                  >
                    📌 待陛下兑用
                  </div>
                )}
              </Card>
            ))}

            {/* + 自定义商品 入口 — 仅 wife（approver）视角 */}
            {isApprover && (
              <motion.button
                onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'storeItemCreate' })}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                className="rounded-card border-2 border-dashed border-brand/40 bg-brand-soft/30 flex flex-col items-center justify-center gap-2 py-6 text-brand-ink active:bg-brand-soft/50 transition-colors min-h-[180px]"
              >
                <div className="w-14 h-14 bg-brand-soft rounded-pill flex items-center justify-center">
                  <PlusCircle size={26} />
                </div>
                <div className="font-bold text-sm">设贡品</div>
                <div className="text-[10px] text-ink-muted px-3 text-center">
                  老婆定价 · 陛下以钱兑用
                </div>
              </motion.button>
            )}
          </div>

          {(() => {
            const pendingConfirm = vouchers.filter(
              (v) => v.pendingRedemption && v.purchasedBy !== currentUser
            );
            if (!pendingConfirm.length) return null;
            return (
              <section>
                <h3 className="font-bold text-state-warning mb-2 flex items-center gap-2">
                  ✂️ 恩诏待核
                </h3>
                <div className="space-y-2">
                  {pendingConfirm.map((v) => (
                    <Card
                      key={v.id}
                      padding="md"
                      tone="surface"
                      className="border-state-warning/40"
                    >
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
                          variant="primary"
                        >
                          ✅ 准核销
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
                          ❌ 驳回
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })()}

          {(() => {
            const myVouchers = vouchers.filter(
              (v) => !v.purchasedBy || v.purchasedBy === currentUser
            );
            if (!myVouchers.length) return null;
            return (
              <section>
                <h3 className="font-bold text-ink-primary mb-2 flex items-center gap-2">
                  <Trophy size={16} className="text-state-warning" /> 朕的恩诏
                </h3>
                <div className="space-y-2">
                  {myVouchers.map((v) => (
                    <Card
                      key={v.id}
                      hoverable
                      padding="md"
                      tone="surface"
                      onClick={() =>
                        dispatch({
                          type: 'OPEN_OVERLAY',
                          overlay: 'voucher',
                          payload: { voucherId: v.id },
                        })
                      }
                      className={`cursor-pointer flex items-center justify-between ${
                        v.isRedeemed ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{v.itemIcon}</span>
                        <div>
                          <div className="font-bold text-sm text-ink-primary">{v.itemTitle}</div>
                          <div className="text-xs text-ink-muted mt-0.5">
                            {new Date(v.purchasedAt).toLocaleString('zh-CN', {
                              month: 'numeric',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                      <Badge
                        tone={
                          v.isRedeemed
                            ? 'neutral'
                            : v.pendingRedemption
                            ? 'warning'
                            : 'brand'
                        }
                      >
                        {v.isRedeemed ? '已用' : v.pendingRedemption ? '待核' : '未用'}
                      </Badge>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })()}
        </div>
      )}

      {/* 兑换二次确认 */}
      <ConfirmModal
        open={confirmingBuy !== null}
        onCancel={() => setConfirmingBuy(null)}
        onConfirm={() => {
          if (confirmingBuy) performBuy(confirmingBuy);
          setConfirmingBuy(null);
        }}
        emoji={confirmingBuy?.icon ?? '🪙'}
        title="确认兑用？"
        body={
          confirmingBuy ? (
            <>
              确定要花掉 <b className="text-ink-primary">{confirmingBuy.cost} 🪙</b><br />
              换得 <b className="text-ink-primary">「{confirmingBuy.title}」</b> 吗？
            </>
          ) : null
        }
        confirmLabel={confirmingBuy ? `兑用 🪙×${confirmingBuy.cost}` : '兑用'}
        cancelLabel="再思量"
      />

      {/* 删除自定义商品确认 */}
      <ConfirmModal
        open={confirmingDelete !== null}
        onCancel={() => setConfirmingDelete(null)}
        onConfirm={() => {
          if (confirmingDelete) {
            dispatch({ type: 'REMOVE_STORE_ITEM', itemId: confirmingDelete.id });
            showToast('🗑️ 已撤贡');
          }
          setConfirmingDelete(null);
        }}
        emoji="🗑️"
        title="撤回此贡品？"
        body={
          confirmingDelete ? (
            <>
              <b className="text-ink-primary">「{confirmingDelete.title}」</b> 将从贡单中撤去。
            </>
          ) : null
        }
        confirmLabel="撤贡"
        cancelLabel="取消"
        confirmTone="danger"
      />
    </motion.div>
  );
}
