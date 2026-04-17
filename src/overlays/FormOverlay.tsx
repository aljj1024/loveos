import { useState } from 'react';
import { XCircle, HeartHandshake } from 'lucide-react';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import { APPROVAL_TEMPLATES } from '../constants';
import type { Approval, ApprovalTemplate } from '../types';

export default function FormOverlay() {
  const { overlayPayload } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const template = (overlayPayload?.template as ApprovalTemplate) ?? 'custom';
  const defaults = APPROVAL_TEMPLATES[template];

  const [reason, setReason] = useState(defaults.reason);
  const [datetime, setDatetime] = useState(defaults.datetime);
  const [sincerity, setSincerity] = useState(defaults.sincerity);
  const [title, setTitle] = useState(defaults.title);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const approval: Approval = {
      id: `approval_${Date.now()}`,
      template,
      title: title || reason,
      reason,
      datetime,
      sincerity,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    dispatch({ type: 'SUBMIT_APPROVAL', approval });
    dispatch({ type: 'CLOSE_OVERLAY' });
    showToast('🚀 奏折已呈交！等待老婆审批');
  }

  const templateMeta: Record<ApprovalTemplate, { emoji: string; color: string }> = {
    basketball: { emoji: '🏀', color: 'text-orange-500' },
    shopping: { emoji: '🛍️', color: 'text-blue-500' },
    truce: { emoji: '🏳️', color: 'text-green-500' },
    custom: { emoji: '📝', color: 'text-rose-500' },
  };
  const meta = templateMeta[template];

  return (
    <div className="absolute inset-0 z-40 bg-white animate-slide-up flex flex-col h-full overflow-y-auto">
      <div className="flex-1 pb-24 bg-rose-50/30">
        <div className="bg-white/80 backdrop-blur-md px-6 pt-10 pb-4 sticky top-0 z-10 border-b border-rose-100 flex items-center">
          <button onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })} className="text-gray-400 p-2 -ml-2">
            <XCircle size={26} />
          </button>
          <h1 className="text-xl font-black text-rose-900 ml-2">
            <span className={meta.color}>{meta.emoji}</span> 起草奏折
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-rose-50 space-y-4">
            {template === 'custom' && (
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">申请标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="例如：周末外出打球"
                  className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-medium border-0 outline-none"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-2">事由</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="说明具体原因..."
                className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-medium border-0 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-2">时间</label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={e => setDatetime(e.target.value)}
                className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-medium border-0 outline-none"
              />
            </div>
          </div>

          <div className="bg-rose-50 p-6 rounded-3xl border-2 border-rose-200">
            <label className="block text-sm font-black text-rose-600 mb-3 flex items-center gap-1.5">
              <HeartHandshake size={18} /> 我的诚意 (保命必填)
            </label>
            <textarea
              rows={3}
              value={sincerity}
              onChange={e => setSincerity(e.target.value)}
              placeholder="许诺一些甜头，提高通过率..."
              className="w-full bg-white rounded-2xl px-4 py-3 text-sm text-rose-900 font-medium border-0 outline-none resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-rose-500 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-rose-200 active:scale-95 transition-transform"
          >
            呈交闻示 📮
          </button>
        </form>
      </div>
    </div>
  );
}
