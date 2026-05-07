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
    showToast('📎 已朱批附旨——任务自入府库');
  }

  return (
    <Drawer open onClose={close} side="bottom">
      <div className="p-5">
        <h2 className="font-bold text-lg text-ink-primary mb-3">📎 准奏附条件</h2>
        <p className="text-sm text-ink-muted mb-3 font-medium">
          准奏附条件——任务自入府库：
        </p>

        <div className="bg-brand-accent-soft p-4 rounded-button border-2 border-brand-accent mb-3">
          <p className="text-xs font-bold text-brand-ink mb-2">
            📌 原奏：{approval.title}
          </p>
          <Textarea
            rows={2}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="例如：洗碗三日、回程带奶茶、给娘娘捏肩..."
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
            钤印颁旨 ✅
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
