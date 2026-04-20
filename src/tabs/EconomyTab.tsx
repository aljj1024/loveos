import { useState } from 'react';
import { Coins, PlusCircle, CheckCircle2, Clock, Trophy } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import type { Voucher } from '../types';

export default function EconomyTab() {
  const { tasks, storeItems, vouchers, points, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [ecoMode, setEcoMode] = useState<'tasks' | 'store'>('tasks');

  // Tasks I accepted and am working on
  const myActiveTasks = tasks.filter(t => t.acceptedBy === currentUser && t.status === 'accepted');
  // Tasks I created that are waiting for verification by me
  const pendingVerifyByMe = tasks.filter(t => t.createdBy === currentUser && t.status === 'pending_verify');
  // Open tasks created by OTHERS (I can accept)
  const openTasks = tasks.filter(t => t.status === 'open' && t.createdBy !== currentUser);
  const doneTasks = tasks.filter(t => t.status === 'verified').slice(0, 3);

  function handleAccept(taskId: string, reward: number, title: string) {
    dispatch({ type: 'ACCEPT_TASK', taskId });
    showToast(`✅ 接单成功！完成后将获得 ${reward} 积分`);
    void title;
  }

  function handleComplete(taskId: string) {
    dispatch({ type: 'COMPLETE_TASK', taskId });
    showToast('📤 已提交验收，等待对方确认！');
  }

  function handleVerify(taskId: string, title: string, reward: number) {
    dispatch({ type: 'VERIFY_TASK', taskId });
    showToast(`🎉 验收通过！+${reward} 积分已到账`);
    void title;
  }

  function handleBuy(itemId: string, cost: number, title: string, icon: string) {
    if (points < cost) {
      showToast('❌ 余额不足，快去接任务赚积分吧！');
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

  const statusActions = {
    open: (task: typeof tasks[0]) => (
      <button
        onClick={() => handleAccept(task.id, task.reward, task.title)}
        className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-md"
      >
        接单
      </button>
    ),
    accepted: (task: typeof tasks[0]) => (
      <button
        onClick={() => handleComplete(task.id)}
        className="bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform"
      >
        标记完成
      </button>
    ),
    pending_verify: (task: typeof tasks[0]) => (
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => handleVerify(task.id, task.title, task.reward)}
          className="bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-transform"
        >
          ✅ 验收通过
        </button>
        <span className="text-xs text-orange-500 font-bold text-center">待验收</span>
      </div>
    ),
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-24 animate-fade-in">
      <GlobalHeader title="家庭央行" subtitle={currentUser === 'wife' ? '发布任务，让老公多做贡献 💪' : '多接任务多赚钱，积分换特权 💰'} />

      {/* Toggle */}
      <div className="px-6 py-4">
        <div className="flex bg-gray-200 p-1 rounded-2xl">
          <button
            onClick={() => setEcoMode('tasks')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${ecoMode === 'tasks' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
          >
            📋 悬赏任务板
          </button>
          <button
            onClick={() => setEcoMode('store')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${ecoMode === 'store' ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-500'}`}
          >
            🎁 心愿集市
          </button>
        </div>
      </div>

      {ecoMode === 'tasks' && (
        <div className="px-6 space-y-4">
          {/* Post task button */}
          <button
            onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'taskCreate' })}
            className="w-full bg-white border-2 border-dashed border-yellow-300 p-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-yellow-600 active:scale-95 transition-transform"
          >
            <PlusCircle size={18} /> 发布新任务
          </button>

          {/* Tasks I'm doing */}
          {myActiveTasks.length > 0 && (
            <div>
              <h3 className="font-extrabold text-gray-600 text-sm mb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-blue-400" /> 我的任务
              </h3>
              <div className="space-y-3">
                {myActiveTasks.map(task => (
                  <div key={task.id} className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{task.icon}</div>
                      <div>
                        <div className="font-extrabold text-gray-800 text-sm">{task.title}</div>
                        <div className="text-xs text-yellow-600 font-bold mt-1 flex items-center gap-1">
                          <Coins size={12} /> +{task.reward} 积分
                        </div>
                      </div>
                    </div>
                    {statusActions.accepted(task)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks I created, pending my verification */}
          {pendingVerifyByMe.length > 0 && (
            <div>
              <h3 className="font-extrabold text-gray-600 text-sm mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-orange-400" /> 待我验收
              </h3>
              <div className="space-y-3">
                {pendingVerifyByMe.map(task => (
                  <div key={task.id} className="bg-orange-50 p-4 rounded-3xl border-2 border-orange-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{task.icon}</div>
                      <div>
                        <div className="font-extrabold text-gray-800 text-sm">{task.title}</div>
                        <div className="text-xs text-yellow-600 font-bold mt-1 flex items-center gap-1">
                          <Coins size={12} /> +{task.reward} 积分
                        </div>
                      </div>
                    </div>
                    {statusActions.pending_verify(task)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available tasks */}
          {openTasks.length > 0 && (
            <div>
              <h3 className="font-extrabold text-gray-600 text-sm mb-2 flex items-center gap-1.5">
                <Coins size={14} className="text-yellow-500" /> 可接任务
              </h3>
              <div className="space-y-3">
                {openTasks.map(task => (
                  <div key={task.id} className="bg-white p-4 rounded-3xl border-2 border-gray-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{task.icon}</div>
                      <div>
                        <div className="font-extrabold text-gray-800">{task.title}</div>
                        {task.sourceApprovalId && (
                          <div className="text-xs text-orange-500 font-bold mt-0.5">📎 审批条件任务</div>
                        )}
                        <div className="text-xs text-yellow-600 font-bold mt-1 flex items-center gap-1">
                          <Coins size={12} /> +{task.reward} 积分
                        </div>
                      </div>
                    </div>
                    {statusActions.open(task)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {openTasks.length === 0 && myActiveTasks.length === 0 && pendingVerifyByMe.length === 0 && (
            <div className="bg-white rounded-3xl p-8 text-center border-2 border-gray-100">
              <div className="text-4xl mb-3">🎊</div>
              <p className="text-gray-400 font-bold text-sm">所有任务都完成啦！</p>
              <p className="text-gray-300 text-xs mt-1">发布新任务继续赚积分</p>
            </div>
          )}

          {/* Done tasks */}
          {doneTasks.length > 0 && (
            <div className="opacity-60">
              <h3 className="font-extrabold text-gray-500 text-sm mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-400" /> 已完成
              </h3>
              <div className="space-y-2">
                {doneTasks.map(task => (
                  <div key={task.id} className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{task.icon}</span>
                      <span className="text-sm font-bold text-gray-500">{task.title}</span>
                    </div>
                    <span className="text-xs text-green-500 font-bold">+{task.reward}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {ecoMode === 'store' && (
        <div className="px-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {storeItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-3xl border-2 border-rose-50 flex flex-col items-center text-center shadow-sm">
                <div className={`w-14 h-14 ${item.colorClass} rounded-full flex items-center justify-center mb-3 text-2xl shadow-inner`}>
                  {item.icon}
                </div>
                <div className="font-extrabold text-gray-800 text-sm mb-1">{item.title}</div>
                <div className="text-xs font-bold text-rose-500 mb-4">{item.cost} 积分</div>
                <button
                  onClick={() => handleBuy(item.id, item.cost, item.title, item.icon)}
                  className={`w-full py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-md ${points >= item.cost ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  {points >= item.cost ? '立即兑换' : '积分不足'}
                </button>
              </div>
            ))}
          </div>

          {/* Partner's vouchers pending my confirmation */}
          {(() => {
            const pendingConfirm = vouchers.filter(v => v.pendingRedemption && v.purchasedBy !== currentUser);
            if (!pendingConfirm.length) return null;
            return (
              <div>
                <h3 className="font-extrabold text-orange-600 mb-3 flex items-center gap-2">
                  ✂️ 待核销确认
                </h3>
                <div className="space-y-2">
                  {pendingConfirm.map(v => (
                    <div key={v.id} className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-200">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{v.itemIcon}</span>
                        <div>
                          <div className="font-bold text-sm text-gray-800">{v.itemTitle}</div>
                          <div className="text-xs text-orange-500 font-bold mt-0.5">对方申请核销此凭证</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { dispatch({ type: 'CONFIRM_VOUCHER', voucherId: v.id }); showToast('✅ 已确认核销！'); }}
                          className="flex-1 bg-green-500 text-white text-xs font-black py-2 rounded-xl active:scale-95 transition-transform"
                        >
                          ✅ 确认核销
                        </button>
                        <button
                          onClick={() => { dispatch({ type: 'REJECT_VOUCHER', voucherId: v.id }); showToast('❌ 已拒绝核销'); }}
                          className="flex-1 bg-gray-200 text-gray-600 text-xs font-black py-2 rounded-xl active:scale-95 transition-transform"
                        >
                          ❌ 拒绝
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* My vouchers */}
          {(() => {
            const myVouchers = vouchers.filter(v => !v.purchasedBy || v.purchasedBy === currentUser);
            if (!myVouchers.length) return null;
            return (
              <div>
                <h3 className="font-extrabold text-gray-700 mb-3 flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-500" /> 我的凭证
                </h3>
                <div className="space-y-2">
                  {myVouchers.map(v => (
                    <div
                      key={v.id}
                      onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'voucher', payload: { voucherId: v.id } })}
                      className={`bg-white p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer active:scale-95 transition-transform ${v.isRedeemed ? 'border-gray-100 opacity-50' : v.pendingRedemption ? 'border-orange-200' : 'border-rose-100'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{v.itemIcon}</span>
                        <div>
                          <div className="font-bold text-sm text-gray-800">{v.itemTitle}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(v.purchasedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${v.isRedeemed ? 'bg-gray-100 text-gray-400' : v.pendingRedemption ? 'bg-orange-100 text-orange-500' : 'bg-rose-100 text-rose-500'}`}>
                        {v.isRedeemed ? '已使用' : v.pendingRedemption ? '待确认' : '未使用'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
