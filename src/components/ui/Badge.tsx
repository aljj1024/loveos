import type { ReactNode } from 'react';

type Tone =
  | 'brand'
  | 'accent'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

type BadgeProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  pill?: boolean;
};

const toneClass: Record<Tone, string> = {
  brand: 'bg-brand text-ink-on-brand',
  accent: 'bg-brand-accent text-brand-ink',
  neutral: 'bg-brand-soft text-ink-secondary',
  success: 'bg-state-success/15 text-state-success',
  warning: 'bg-state-warning/20 text-state-warning',
  danger: 'bg-state-danger/15 text-state-danger',
  info: 'bg-state-info/15 text-state-info',
};

export default function Badge({
  tone = 'neutral',
  children,
  className = '',
  pill = true,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold ${
        pill ? 'rounded-pill' : 'rounded-md'
      } ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
