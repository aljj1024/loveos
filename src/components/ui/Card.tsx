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
  ornate?: boolean;
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

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rot = { tl: '0', tr: '90', br: '180', bl: '270' }[position];
  const pos = {
    tl: 'top-1.5 left-1.5',
    tr: 'top-1.5 right-1.5',
    bl: 'bottom-1.5 left-1.5',
    br: 'bottom-1.5 right-1.5',
  }[position];
  return (
    <svg
      className={`absolute ${pos} w-3 h-3 text-brand pointer-events-none`}
      viewBox="0 0 12 12"
      fill="none"
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <path
        d="M0 11 L0 1 Q0 0 1 0 L11 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      } ${paddingClass[padding]} ${className}`}
      {...rest}
    >
      {glassy && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-card pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 40%)',
            mixBlendMode: 'overlay',
          }}
        />
      )}
      {ornate && (
        <>
          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />
        </>
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
