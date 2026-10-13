import { Loader } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ariaLabel,
  onClick,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const classes = [
    'vv-button',
    `vv-button--${variant}`,
    `vv-button--${size}`,
    pill ? 'vv-button--pill' : '',
    loading ? 'vv-button--loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      onClick={onClick}
      {...rest}
    >
      {loading && (
        <span className="vv-button__spinner" aria-hidden="true">
          <Loader size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} />
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;
