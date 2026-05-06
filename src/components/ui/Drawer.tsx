import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: 'bottom' | 'top' | 'full';
  className?: string;
  dismissOnBackdrop?: boolean;
};

export default function Drawer({
  open,
  onClose,
  children,
  side = 'bottom',
  className = '',
  dismissOnBackdrop = true,
}: DrawerProps) {
  const layoutClass =
    side === 'bottom'
      ? 'justify-end'
      : side === 'top'
      ? 'justify-start'
      : 'items-stretch';

  const sheetClass =
    side === 'bottom'
      ? 'rounded-t-card'
      : side === 'top'
      ? 'rounded-b-card'
      : 'h-full';

  const initialY = side === 'top' ? '-100%' : side === 'bottom' ? '100%' : '0%';
  const initialOpacity = side === 'full' ? 0 : 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`absolute inset-0 z-50 flex flex-col ${layoutClass}`}
          style={{ background: 'var(--bg-overlay)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => dismissOnBackdrop && onClose()}
        >
          <motion.div
            className={`bg-bg-elevated text-ink-primary shadow-elevated overflow-hidden ${sheetClass} ${className}`}
            initial={{ y: initialY, opacity: initialOpacity }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: initialY, opacity: initialOpacity }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
