import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export type TabItem<T extends string> = {
  id: T;
  label: ReactNode;
  badge?: ReactNode;
};

type TabProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  layoutId?: string;
};

export default function Tab<T extends string>({
  items,
  value,
  onChange,
  className = '',
  layoutId = 'ui-tab-pill',
}: TabProps<T>) {
  return (
    <div className={`relative inline-flex p-1 rounded-pill bg-brand-soft ${className}`}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`relative px-4 py-1.5 text-sm font-medium rounded-pill ${
              active ? 'text-ink-on-brand' : 'text-ink-secondary'
            }`}
          >
            {active && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-pill bg-brand"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {item.label}
              {item.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}
