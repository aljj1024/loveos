import { ChevronRight, Heart, Wrench, AlertOctagon } from 'lucide-react';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';

export default function ApprovalOverlay() {
  const { approvals, overlayPayload, currentUser, wikiProfiles } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const approvalId = overlayPayload?.approvalId as string;
  const approval = approvals.find(a => a.id === approvalId);

  if (!approval) return null;

  const isWife = currentUser === 'wife';
  const submitterProfile = wikiProfiles.find(p => p.id === (approval.submittedBy ?? 'husband'));
  const submitterName = submitterProfile?.displayName ?? '老公';

  function handleApprove() {
    dispatch({ type: 'RESOLVE_APPROVAL', id: approval!.id, status: 'approved', pointsDeducted: 50 });
    dispatch({ type: 'CLOSE_OVERLAY' });
    showToast('✅ 已准奏！扣除 50 积分');
  }

  function handleConditional() {
    dispatch({ type: 'OPEN_OVERLAY', overlay: 'conditional', payload: { approvalId: approval!.id } });
  }

  function handleReject() {
    dispatch({ type: 'RESOLVE_APPROVAL', id: approval!.id, status: 'rejected' });
    dispatch({ type: 'CLOSE_OVERLAY' });
    showToast('⚠️ 已驳回！搓衣板警告 🙏');
  }

  const templateEmoji: Record<string, string> = {
    basketball: '🏀',
    shopping: '🛍️',
    truce: '🏳️',
    custom: '📝',
  };

  const statusLabel: Record<string, { text: string; classes: string }> = {
    approved: { text: '✅ 已准奏', classes: 'bg-green-100 text-green-700' },
    rejected: { text: '❌ 已驳回', classes: 'bg-gray-100 text-gray-600' },
    conditional: { text: '📎 条件通过', classes: 'bg-orange-100 text-orange-700' },
  };

  return (
    <div className="absolute inset-0 z-40 animate-slide-up flex flex-col h-full">
      <div className="flex-1 bg-gray-100 pb-24 overflow-y-auto">
        <div className="bg-gradient-to-br from-rose-400 to-pink-500 px-6 pt-10 pb-20">
          <button
            onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })}
            className="text-white mb-4 bg-white/20 p-2 rounded-full"
          >
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h1 className="text-3xl font-black text-white mb-2">审批详情</h1>
          <p className="text-rose-100 text-sm">
            {isWife ? '请慎重审阅，盖章后不可撤回' : '等待老婆大人审阅中...'}
          </p>
        </div>

        <div className="px-4 -mt-14 relative z-10">
          <div className="bg-white rounded-[2rem] shadow-xl p-6 border-4 border-white mb-6">
            <div className="flex items-center gap-4 border-b-2 border-dashed border-gray-100 pb-4 mb-4">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-2xl border-2 border-white">
                {templateEmoji[approval.template] ?? '📝'}
              </div>
              <div>
                <div className="font-black text-lg text-gray-800">{approval.title}</div>
                <div className="text-xs text-gray-400 font-medium mt-1">
                  {submitterName} · {new Date(approval.submittedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div className="text-sm space-y-2 font-bold text-gray-700">
              <p>📝 事由：{approval.reason}</p>
              {approval.datetime && (
                <p>⏰ 时间：{new Date(approval.datetime).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              )}
            </div>

            <div className="mt-4 bg-rose-50 p-4 rounded-xl border border-rose-100">
              <span className="text-rose-500 font-black text-xs block mb-1">✨ TA的诚意</span>
              <span className="font-bold text-rose-900 text-sm">{approval.sincerity}</span>
            </div>

            {/* Non-pending: show result status */}
            {approval.status !== 'pending' && statusLabel[approval.status] && (
              <div className={`mt-4 p-3 rounded-xl text-center font-black text-sm ${statusLabel[approval.status].classes}`}>
                {statusLabel[approval.status].text}
                {approval.conditionText && <p className="text-xs font-medium mt-1">条件：{approval.conditionText}</p>}
              </div>
            )}
          </div>

          {/* Wife: action buttons. Husband: read-only */}
          {isWife && approval.status === 'pending' && (
            <div className="grid grid-cols-2 gap-3 pb-4">
              <button
                onClick={handleApprove}
                className="col-span-2 bg-green-500 text-white p-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
              >
                <Heart size={20} fill="currentColor" /> 准奏 (扣 50 积分)
              </button>
              <button
                onClick={handleConditional}
                className="bg-orange-400 text-white p-4 rounded-2xl font-black text-sm flex flex-col items-center gap-2 shadow-md active:scale-95 transition-transform"
              >
                <Wrench size={24} /> 拿家务换
              </button>
              <button
                onClick={handleReject}
                className="bg-gray-800 text-white p-4 rounded-2xl font-black text-sm flex flex-col items-center gap-2 shadow-md active:scale-95 transition-transform"
              >
                <AlertOctagon size={24} className="text-rose-400" /> 驳回警告
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
