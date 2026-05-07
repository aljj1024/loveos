import type { ReactNode, CSSProperties } from 'react';

type Size = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  emoji?: string;
  src?: string;
  alt?: string;
  size?: Size;
  className?: string;
  ring?: boolean;
  fallback?: ReactNode;
};

const sizeClass: Record<Size, string> = {
  sm: 'w-8 h-8 text-base',
  md: 'w-10 h-10 text-xl',
  lg: 'w-14 h-14 text-2xl',
  xl: 'w-20 h-20 text-4xl',
};

const ringStyle: CSSProperties = {
  boxShadow:
    '0 0 0 2px var(--bg-surface), 0 0 0 4px var(--wood-edge), 0 2px 4px rgba(0,0,0,0.08)',
};

export default function Avatar({
  emoji,
  src,
  alt = '',
  size = 'md',
  ring = true,
  fallback,
  className = '',
}: AvatarProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-pill bg-brand-accent-soft text-brand-ink overflow-hidden ${sizeClass[size]} ${className}`}
      style={ring ? ringStyle : undefined}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        emoji ?? fallback
      )}
    </div>
  );
}
