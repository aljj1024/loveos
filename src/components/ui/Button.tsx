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
    'bg-brand text-ink-on-brand shadow-[0_3px_0_var(--brand-ink),0_6px_14px_-4px_rgba(139,46,46,0.35)]',
  accent:
    'bg-brand-accent text-ink-on-brand shadow-[0_3px_0_#8B6624,0_6px_14px_-4px_rgba(212,166,69,0.45)]',
  secondary:
    'bg-brand-soft text-brand-ink shadow-[0_2px_0_rgba(139,46,46,0.15)]',
  ghost: 'bg-transparent text-ink-secondary',
  danger:
    'bg-state-danger text-white shadow-[0_3px_0_#8E4F46,0_6px_14px_-4px_rgba(201,112,100,0.45)]',
};

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1',
  md: 'px-4 py-2.5 text-sm gap-1.5',
  lg: 'px-5 py-3 text-base gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  flat: _flat = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ y: 2, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className={`relative inline-flex items-center justify-center font-bold rounded-button disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantClass[variant]} ${sizeClass[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      <span className="relative inline-flex items-center justify-center gap-1.5">
        {children}
      </span>
    </motion.button>
  );
}
