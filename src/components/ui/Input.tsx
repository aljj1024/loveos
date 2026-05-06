import { forwardRef, type InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className = '', ...rest }, ref) => (
    <input
      ref={ref}
      className={`w-full bg-bg-base border-2 rounded-button px-4 py-3 text-ink-primary placeholder:text-ink-muted outline-none transition-colors ${
        invalid ? 'border-state-danger' : 'border-line-subtle focus:border-brand'
      } ${className}`}
      {...rest}
    />
  )
);
Input.displayName = 'Input';
export default Input;
