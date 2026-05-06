import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, PlusCircle, CheckCircle2, Clock, Trophy } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import type { Voucher } from '../types';
import { Card, Badge, Button, Tab, EmptyState } from '../components/ui';

type EcoMode = 'tasks' | 'store';

export default function EconomyTab() {
  const { tasks, storeItems, vouchers, points, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [ecoMode, setEcoMode] = useState<EcoMode>('tasks');

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
    showToast(`✅ 接单成功！完成后将获得 ${reward} 金币`);
  }

  function handleComplete(taskId: string) {
    dispatch({ type: 'COMPLETE_TASK', taskId });
    showToast('📤 已提交验收，等待对方确认！');
  }

  function handleVerify(taskId: string, reward: number) {
    dispatch({ type: 'VERIFY_TASK', taskId });
    showToast(`🎉 验收通过！+${reward} 金币已到账`);
  }

  function handleBuy(itemId: string, cost: number, title: string, icon: string) {
    if (points < cost) {
      showToast('❌ 金币不足，快去接任务吧！');
      return;
    }
    const voucher: Voucher = {
      id: `voucher_${Date.now()}`,
      itemId,
      itemTitle: title,
      itemIcon: icon,
      purchasedAt: new Date().toISOString(),
      purchasedBy: currentUser ?? undefined,
      isRedeemed: false,
      pendingRedemption: false,
    };
    dispatch({ type: 'BUY_ITEM', itemId, voucher });
    dispatch({ type: 'OPEN_OVERLAY', overlay: 'voucher', payload: { voucherId: voucher.id } });
    showToast(`🎁 兑换成功！获得「${title}」`);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto bg-bg-base pb-24"
    >
      <GlobalHeader
        title="宝物"
        subtitle={
          currentUser === 'wife'
            ? '发布任务，让老公多做贡献 💪'
            : '多接任务多赚金币，兑换特权 💰'
        }
      />

      <div className="px-5 py-4 flex justify-center">
        <Tab<EcoMode>
          items={[
            { id: 'tasks', label: '📋 任务广场' },
            { id: 'store', label: '🎁 兑换商店' },
          ]}
          value={ecoMode}
          onChange={setEcoMode}
          layoutId="economy-mode"
        />
      </div>

      {ecoMode === 'tasks' && (
        <div className="px-5 space-y-4">
          <Button
            onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'taskCreate' })}
            variant="secondary"
            fullWidth
            className="border-2 border-dashed border-brand/40"
          >
            <PlusCircle size={18} /> 发布新任务
          </Button>

          {myActiveTasks.length > 0 && (
            <section>
              <h3 className="font-bold text-ink-secondary text-sm mb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-state-info" /> 我的任务
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
                          <Coins size={12} /> +{task.reward} 金币
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleComplete(task.id)} className="bg-state-info text-white">
                      标记完成
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {pendingVerifyByMe.length > 0 && (
            <section>
              <h3 className="font-bold text-ink-secondary text-sm mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-state-warning" /> 待我验收
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
                          <Coins size={12} /> +{task.reward} 金币
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleVerify(task.id, task.reward)}
                        className="bg-state-success text-white"
                      >
                        ✅ 通过
                      </Button>
                      <span className="text-[10px] text-state-warning font-bold">待验收</span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {openTasks.length > 0 && (
            <section>
              <h3 className="font-bold text-ink-secondary text-sm mb-2 flex items-center gap-1.5">
                <Coins size={14} className="text-state-warning" /> 可接任务
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
                            📎 申请条件任务
                          </div>
                        )}
                        <div className="text-xs text-state-warning font-bold mt-1 flex items-center gap-1">
                          <Coins size={12} /> +{task.reward} 金币
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAccept(task.id, task.reward)}>
                      接单
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
                  icon="🎊"
                  title="所有任务都完成啦！"
                  description="发布新任务继续赚金币"
                />
              </Card>
            )}

          {doneTasks.length > 0 && (
            <section className="opacity-60">
              <h3 className="font-bold text-ink-muted text-sm mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-state-success" /> 已完成
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
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`w-14 h-14 ${item.colorClass} rounded-pill flex items-center justify-center mb-2.5 text-2xl shadow-inner`}
                  style={{
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 12px -4px rgba(167,139,250,0.4)',
                  }}
                >
                  {item.icon}
                </div>
                <div className="font-bold text-ink-primary text-sm mb-1">{item.title}</div>
                <div className="text-xs font-bold text-brand-ink mb-3 flex items-center gap-1">
                  <Coins size={11} /> {item.cost}
                </div>
                <Button
                  size="sm"
                  fullWidth
                  variant={points >= item.cost ? 'primary' : 'secondary'}
                  disabled={points < item.cost}
                  onClick={() => handleBuy(item.id, item.cost, item.title, item.icon)}
                >
                  {points >= item.cost ? '立即兑换' : '金币不足'}
                </Button>
              </Card>
            ))}
          </div>

          {(() => {
            const pendingConfirm = vouchers.filter(
              (v) => v.pendingRedemption && v.purchasedBy !== currentUser
            );
            if (!pendingConfirm.length) return null;
            return (
              <section>
                <h3 className="font-bold text-state-warning mb-2 flex items-center gap-2">
                  ✂️ 待核销确认
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
                  <Trophy size={16} className="text-state-warning" /> 我的凭证
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
                        {v.isRedeemed ? '已使用' : v.pendingRedemption ? '待确认' : '未使用'}
                      </Badge>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })()}
        </div>
      )}
    </motion.div>
  );
}
