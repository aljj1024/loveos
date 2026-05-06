import { useState } from 'react';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import type { Task } from '../types';
import { Drawer, Button, Textarea } from '../components/ui';

export default function ConditionalOverlay() {
  const { approvals, overlayPayload, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [condition, setCondition] = useState('');

  const approvalId = overlayPayload?.approvalId as string;
  const approval = approvals.find((a) => a.id === approvalId);

  if (!approval) return null;

  function close() {
    dispatch({ type: 'CLOSE_OVERLAY' });
  }

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
    dispatch({
      type: 'CONDITIONAL_APPROVAL',
      id: approvalId,
      conditionText: condition,
      taskId,
    });
    close();
    showToast('🧹 已附条件通过！任务已生成到任务广场');
  }

  return (
    <Drawer open onClose={close} side="bottom">
      <div className="p-5">
        <h2 className="font-bold text-lg text-ink-primary mb-3">🧹 附带条件通过</h2>
        <p className="text-sm text-ink-muted mb-3 font-medium">
          审批通过，但需完成以下任务。任务会自动添加到「宝物 → 任务广场」：
        </p>

        <div className="bg-brand-accent-soft p-4 rounded-button border-2 border-brand-accent mb-3">
          <p className="text-xs font-bold text-brand-ink mb-2">
            📌 原申请：{approval.title}
          </p>
          <Textarea
            rows={2}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="例如：洗碗三天、帮买奶茶、给我捏肩..."
            autoFocus
            className="bg-bg-surface"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={close}>
            取消
          </Button>
          <Button
            fullWidth
            onClick={handleConfirm}
            disabled={!condition.trim()}
          >
            确认盖章 ✅
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
