import { motion, type HTMLMotionProps } from 'framer-motion';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'solid' | 'soft' | 'ghost';

type IconButtonProps = HTMLMotionProps<'button'> & {
  size?: Size;
  variant?: Variant;
  ariaLabel: string;
};

const sizeClass: Record<Size, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const variantClass: Record<Variant, string> = {
  solid: 'bg-brand text-ink-on-brand shadow-card',
  soft: 'bg-brand-soft text-brand-ink',
  ghost: 'bg-transparent text-ink-secondary',
};

export default function IconButton({
  size = 'md',
  variant = 'soft',
  ariaLabel,
  className = '',
  children,
  ...rest
}: IconButtonProps) {
  return (
    <motion.button
      aria-label={ariaLabel}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className={`inline-flex items-center justify-center rounded-pill ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
