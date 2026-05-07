import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';
type Tone = 'surface' | 'soft' | 'accent';

type CardProps = Omit<HTMLMotionProps<'div'>, 'children'> & {
  children?: ReactNode;
  hoverable?: boolean;
  padding?: Padding;
  tone?: Tone;
  bordered?: boolean;
  /** 顶部加一道动森木纹装饰条（替代旧 miHoYo 棱角装饰）。 */
  ornate?: boolean;
  /** 暖纸纹叠加，给卡片一点手作感。 */
  glassy?: boolean;
};

const paddingClass: Record<Padding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const toneClass: Record<Tone, string> = {
  surface: 'bg-bg-surface',
  soft: 'bg-brand-soft',
  accent: 'bg-brand-accent-soft',
};

export default function Card({
  hoverable = false,
  padding = 'md',
  tone = 'surface',
  bordered = true,
  ornate = false,
  glassy = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`relative rounded-card shadow-card ${toneClass[tone]} ${
        bordered ? 'border border-line-subtle' : ''
      } ${paddingClass[padding]} ${ornate ? 'overflow-hidden' : ''} ${className}`}
      {...rest}
    >
      {ornate && (
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none"
          style={{ background: 'var(--wood-strip)' }}
        />
      )}
      {glassy && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-card pointer-events-none"
          style={{
            backgroundImage: 'var(--pattern-paper)',
            backgroundSize: 'var(--pattern-size, 220px 220px)',
            mixBlendMode: 'multiply',
            opacity: 0.7,
          }}
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
