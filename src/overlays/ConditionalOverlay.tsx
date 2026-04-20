import { useState } from 'react';
import { XCircle } from 'lucide-react';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';

import type { Task } from '../types';

export default function ConditionalOverlay() {
  const { approvals, overlayPayload, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [condition, setCondition] = useState('');

  const approvalId = overlayPayload?.approvalId as string;
  const approval = approvals.find(a => a.id === approvalId);

  if (!approval) return null;

  function handleConfirm() {
    if (!condition.trim()) return;
    const taskId = `task_${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      title: condition,
      icon: '📋',
      reward: 0,
      createdBy: currentUser ?? 'wife',
      status: 'open',
      createdAt: new Date().toISOString(),
      sourceApprovalId: approvalId,
    };
    dispatch({ type: 'CREATE_TASK', task: newTask });
    dispatch({ type: 'CONDITIONAL_APPROVAL', id: approvalId, conditionText: condition, taskId });
    dispatch({ type: 'CLOSE_OVERLAY' });
    showToast('🧹 已附带条件通过！任务已生成到任务板');
  }

  return (
    <div className="absolute inset-0 z-50 bg-black/40 flex items-end animate-fade-in">
      <div className="w-full bg-white rounded-t-[2rem] p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-xl text-gray-800">🧹 附带条件通过</h2>
          <button onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })} className="text-gray-400">
            <XCircle size={26} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4 font-medium">
          审批通过，但需完成以下任务。任务将自动添加到悬赏任务板：
        </p>

        <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-200 mb-2">
          <p className="text-xs font-bold text-orange-500 mb-2">📌 原申请：{approval.title}</p>
          <textarea
            rows={2}
            value={condition}
            onChange={e => setCondition(e.target.value)}
            placeholder="例如：洗碗三天、帮买奶茶、给我捏肩..."
            className="w-full bg-white rounded-xl px-4 py-3 text-sm font-medium border border-orange-100 outline-none resize-none"
            autoFocus
          />
        </div>

        <button
          onClick={handleConfirm}
          disabled={!condition.trim()}
          className="w-full bg-orange-400 text-white font-black py-4 rounded-2xl mt-3 disabled:opacity-40 active:scale-95 transition-transform shadow-md"
        >
          确认盖章 ✅
        </button>
      </div>
    </div>
  );
}
