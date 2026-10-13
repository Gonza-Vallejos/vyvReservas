import { forwardRef } from 'react';
import { X } from 'lucide-react';

const InputField = forwardRef((
  {
    id,
    label,
    type = 'text',
    value,
    onChange,
    onFocus,
    onBlur,
    placeholder,
    icon: Icon,
    error,
    helper,
    required = false,
    name,
    min,
    max,
    autoComplete,
    clearable = false,
    onClear,
    className = '',
  },
  ref
) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  const hasError = Boolean(error);
  const helperId = helper ? `${inputId}-helper` : undefined;
  const errorId = hasError ? `${inputId}-error` : undefined;

  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`vv-input ${hasError ? 'vv-input--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="vv-input__label">
          {label}
          {required && <span className="vv-input__required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="vv-input__wrapper">
        {Icon && (
          <span className="vv-input__icon" aria-hidden="true">
            <Icon size={20} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className="vv-input__field"
        />
        {clearable && value && (
          <button
            type="button"
            className="vv-input__clear"
            onClick={onClear}
            aria-label="Limpiar campo"
            tabIndex={-1}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {helper && !hasError && (
        <div id={helperId} className="vv-input__helper">
          {helper}
        </div>
      )}
      {hasError && (
        <div id={errorId} className="vv-input__error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
