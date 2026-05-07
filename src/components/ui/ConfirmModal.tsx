import type { ReactNode } from 'react';
import Modal from './Modal';
import Button from './Button';

type ConfirmTone = 'primary' | 'danger';

type ConfirmModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  emoji?: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: ConfirmTone;
};

export default function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  title,
  emoji,
  body,
  confirmLabel = '确认',
  cancelLabel = '取消',
  confirmTone = 'primary',
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="px-6 pt-6 pb-5 text-center">
        {emoji && (
          <div className="text-5xl mb-3 leading-none select-none">{emoji}</div>
        )}
        <h2 className="text-lg font-bold text-ink-primary mb-2 font-display tracking-wide">
          {title}
        </h2>
        {body && (
          <div className="text-sm text-ink-secondary leading-relaxed mb-5">
            {body}
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmTone === 'danger' ? 'danger' : 'primary'}
            fullWidth
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
