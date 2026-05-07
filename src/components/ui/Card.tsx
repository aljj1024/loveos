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
  /** 顶部加描金细线 + 中央朱印 + 右下小印的"开卷"装饰（戏精政务版）。 */
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
        <>
          {/* 顶部描金细线（左右渐隐 + 中央留白给朱印） */}
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, var(--brand-accent) 18%, #B8862E 38%, transparent 48%, transparent 52%, #B8862E 62%, var(--brand-accent) 82%, transparent 100%)',
              opacity: 0.85,
            }}
          />
          {/* 中央朱印小圆（开卷印） */}
          <div
            aria-hidden
            className="absolute top-[-3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-pill pointer-events-none"
            style={{
              background: 'var(--brand-primary)',
              boxShadow: '0 0 0 1.5px var(--bg-surface), 0 1px 3px rgba(139,46,46,0.4)',
            }}
          />
          {/* 右下角呼应朱印（落款） */}
          <div
            aria-hidden
            className="absolute bottom-1.5 right-1.5 pointer-events-none"
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: 'var(--brand-primary)',
              opacity: 0.32,
              boxShadow: 'inset 0 0 0 1px rgba(139,46,46,0.5)',
            }}
          />
        </>
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
