import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center py-10 px-6 ${className}`}>
      {icon && <div className="text-5xl mb-3 opacity-70">{icon}</div>}
      <h3 className="text-base font-semibold text-ink-primary">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
