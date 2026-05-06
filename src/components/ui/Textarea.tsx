import { forwardRef, type TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid, className = '', rows = 3, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={`w-full bg-bg-base border-2 rounded-button px-4 py-3 text-ink-primary placeholder:text-ink-muted outline-none transition-colors resize-none ${
        invalid ? 'border-state-danger' : 'border-line-subtle focus:border-brand'
      } ${className}`}
      {...rest}
    />
  )
);
Textarea.displayName = 'Textarea';
export default Textarea;
