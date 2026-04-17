import { ChevronRight } from 'lucide-react';
import { useAppState, useAppDispatch } from '../context/AppContext';

export default function StatsOverlay() {
  const { ledger, approvals, points, overlayPayload } = useAppState();
  const dispatch = useAppDispatch();

  const mode = (overlayPayload?.mode as string) ?? 'stats';

  const totalEarned = ledger.filter(e => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const totalSpent = ledger.filter(e => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);

  const approvalHistory = approvals.filter(a => a.status !== 'pending');

  const statusLabel: Record<string, string> = {
    approved: '✅ 已准奏',
    rejected: '❌ 已驳回',
    conditional: '🧹 条件通过',
  };

  return (
    <div className="absolute inset-0 z-40 bg-white animate-slide-up flex flex-col h-full overflow-y-auto">
      <div className="bg-white/80 backdrop-blur-md px-6 pt-10 pb-4 sticky top-0 z-10 border-b border-gray-100 flex items-center">
        <button onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })} className="text-gray-400 p-2 -ml-2">
          <ChevronRight size={26} className="rotate-180" />
        </button>
        <h1 className="text-xl font-black text-gray-800 ml-2">
          {mode === 'history' ? '审批历史记录' : '积分统计'}
        </h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {mode === 'stats' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 p-4 rounded-2xl text-center border-2 border-green-100">
                <div className="font-black text-2xl text-green-600">+{totalEarned}</div>
                <div className="text-xs text-green-500 font-bold mt-1">总收入</div>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl text-center border-2 border-red-100">
                <div className="font-black text-2xl text-red-500">-{totalSpent}</div>
                <div className="text-xs text-red-400 font-bold mt-1">总支出</div>
              </div>
              <div className="bg-rose-50 p-4 rounded-2xl text-center border-2 border-rose-100">
                <div className="font-black text-2xl text-rose-600">{points}</div>
                <div className="text-xs text-rose-400 font-bold mt-1">当前余额</div>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-gray-700 mb-3">最近流水</h3>
              {ledger.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">还没有积分记录哦</p>
              )}
              <div className="space-y-2">
                {ledger.slice(0, 20).map(entry => (
                  <div key={entry.id} className="bg-gray-50 px-4 py-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-800">{entry.description}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(entry.timestamp).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className={`font-black text-lg ${entry.amount > 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {entry.amount > 0 ? '+' : ''}{entry.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === 'history' && (
          <div>
            {approvalHistory.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-16">还没有处理过的奏折哦</p>
            )}
            <div className="space-y-3">
              {approvalHistory.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-extrabold text-gray-800 text-sm">{a.title}</div>
                    <span className="text-xs font-bold">{statusLabel[a.status] ?? a.status}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-medium">{a.reason}</div>
                  {a.conditionText && (
                    <div className="mt-2 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-1.5 font-bold">
                      条件：{a.conditionText}
                    </div>
                  )}
                  <div className="text-xs text-gray-300 mt-2">
                    {new Date(a.resolvedAt!).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
