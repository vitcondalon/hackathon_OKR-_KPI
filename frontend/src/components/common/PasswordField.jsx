import { useId, useState } from 'react';
import { classNames } from '../../utils/format';

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M3 3l18 18" />
        <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
        <path d="M9.4 5.5A10.7 10.7 0 0 1 12 5.2c4.8 0 8.3 3.1 9.8 6.8a1 1 0 0 1 0 .8 11.2 11.2 0 0 1-3.7 4.8" />
        <path d="M6.2 6.3A11.1 11.1 0 0 0 2.2 12a1 1 0 0 0 0 .8c1.5 3.7 5 6.8 9.8 6.8 1 0 2-.1 2.9-.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2.2 12a1 1 0 0 1 0-.8C3.7 7.5 7.2 4.4 12 4.4s8.3 3.1 9.8 6.8a1 1 0 0 1 0 .8C20.3 15.7 16.8 18.8 12 18.8S3.7 15.7 2.2 12Z" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

export default function PasswordField({
  id,
  wrapperClassName = '',
  inputClassName = '',
  toggleLabels = {
    show: 'Show password',
    hide: 'Hide password'
  },
  ...props
}) {
  const generatedId = useId();
  const [visible, setVisible] = useState(false);
  const inputId = id || generatedId;
  const toggleLabel = visible ? toggleLabels.hide : toggleLabels.show;

  return (
    <div className={classNames('relative', wrapperClassName)}>
      <input
        {...props}
        id={inputId}
        type={visible ? 'text' : 'password'}
        className={classNames('pr-12', inputClassName)}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-1.5 my-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-transparent text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        aria-controls={inputId}
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        <EyeIcon visible={visible} />
      </button>
    </div>
  );
}
