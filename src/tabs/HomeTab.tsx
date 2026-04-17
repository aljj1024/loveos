import { ShoppingBag, ShieldAlert, ChevronRight, PlusCircle } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { useAppState, useAppDispatch } from '../context/AppContext';

export default function HomeTab() {
  const { approvals } = useAppState();
  const dispatch = useAppDispatch();

  const pendingApprovals = approvals.filter(a => a.status === 'pending');

  const statusBadge: Record<string, { label: string; classes: string }> = {
    pending: { label: '待审批', classes: 'bg-rose-100 text-rose-600' },
    approved: { label: '已准奏', classes: 'bg-green-100 text-green-600' },
    rejected: { label: '已驳回', classes: 'bg-gray-100 text-gray-500' },
    conditional: { label: '条件通过', classes: 'bg-orange-100 text-orange-600' },
  };

  return (
    <div className="flex-1 overflow-y-auto bg-rose-50/50 pb-24 animate-fade-in">
      <GlobalHeader title="LoveOS" subtitle="今天也是努力搬砖养家的一天 ☀️" />

      {/* 快捷操作 */}
      <div className="px-6 py-6">
        <h2 className="text-rose-900 font-extrabold mb-4 flex items-center gap-2 text-lg">
          <span className="bg-white text-rose-500 p-1.5 rounded-xl shadow-sm">✨</span> 快捷奏折
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'form', payload: { template: 'basketball' } })}
            className="bg-white p-4 rounded-3xl shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-transform border-2 border-rose-50"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shadow-inner text-2xl">🏀</div>
            <span className="text-xs font-bold text-gray-700">打球申请</span>
          </button>
          <button
            onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'form', payload: { template: 'shopping' } })}
            className="bg-white p-4 rounded-3xl shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-transform border-2 border-rose-50"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 shadow-inner">
              <ShoppingBag size={24} />
            </div>
            <span className="text-xs font-bold text-gray-700">购物报备</span>
          </button>
          <button
            onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'form', payload: { template: 'truce' } })}
            className="bg-white p-4 rounded-3xl shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-transform border-2 border-rose-50"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500 shadow-inner">
              <ShieldAlert size={24} />
            </div>
            <span className="text-xs font-bold text-gray-700">赛博休战</span>
          </button>
        </div>

        {/* Custom */}
        <button
          onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'form', payload: { template: 'custom' } })}
          className="mt-3 w-full bg-white/60 border-2 border-dashed border-rose-200 p-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-rose-400 active:scale-95 transition-transform"
        >
          <PlusCircle size={16} /> 自定义奏折
        </button>
      </div>

      {/* 待审批 */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-rose-900 font-extrabold text-lg">待批阅的奏折</h2>
          <button
            onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'approvalHistory', payload: { mode: 'history' } })}
            className="text-xs text-rose-400 font-bold flex items-center gap-1"
          >
            历史记录 <ChevronRight size={14} />
          </button>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border-2 border-rose-50 shadow-sm">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-gray-400 font-bold text-sm">暂无待审批的奏折</p>
            <p className="text-gray-300 text-xs mt-1">男同志今天表现不错哦</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map(app => (
              <div
                key={app.id}
                onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'approval', payload: { approvalId: app.id } })}
                className="bg-white p-5 rounded-3xl shadow-sm border-2 border-rose-50 flex items-center justify-between active:bg-rose-50 transition-colors cursor-pointer"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 font-bold text-xs">急</div>
                  <div>
                    <h3 className="font-extrabold text-gray-800">{app.title}</h3>
                    <p className="text-xs text-rose-400 mt-1 font-medium">
                      老公 · {new Date(app.submittedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="bg-rose-500 text-white p-2 rounded-full shadow-sm">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 所有奏折 (非pending) */}
        {approvals.filter(a => a.status !== 'pending').slice(0, 3).map(app => {
          const badge = statusBadge[app.status];
          return (
            <div key={app.id} className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center justify-between mt-3 opacity-60">
              <div>
                <div className="font-bold text-gray-700 text-sm">{app.title}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(app.resolvedAt ?? app.submittedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric' })}
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${badge?.classes}`}>{badge?.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
