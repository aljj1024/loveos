import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  flat?: boolean;
};

const variantClass: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-brand to-brand-ink text-ink-on-brand shadow-[0_4px_12px_-2px_rgba(167,139,250,0.45)]',
  accent:
    'bg-gradient-to-b from-brand-accent to-brand text-ink-on-brand shadow-[0_4px_12px_-2px_rgba(251,207,232,0.55)]',
  secondary: 'bg-brand-soft text-brand-ink',
  ghost: 'bg-transparent text-ink-secondary',
  danger:
    'bg-gradient-to-b from-state-danger/90 to-state-danger text-white shadow-[0_4px_12px_-2px_rgba(248,113,113,0.45)]',
};

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1',
  md: 'px-4 py-2.5 text-sm gap-1.5',
  lg: 'px-5 py-3 text-base gap-2',
};

const isSolid = (v: Variant) => v === 'primary' || v === 'accent' || v === 'danger';

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  flat = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const showSheen = isSolid(variant) && !flat;
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className={`relative overflow-hidden inline-flex items-center justify-center font-bold rounded-button disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantClass[variant]} ${sizeClass[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {showSheen && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
      )}
      <span className="relative inline-flex items-center justify-center gap-1.5">
        {children}
      </span>
    </motion.button>
  );
}
