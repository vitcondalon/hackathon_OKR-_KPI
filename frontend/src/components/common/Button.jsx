import { classNames } from '../../utils/format';

export default function Button({ className = '', variant = 'primary', ...props }) {
  const variants = {
    primary:
      'border border-transparent bg-brand-500 text-white shadow-[0_10px_20px_rgba(36,107,255,0.28)] hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-[0_14px_24px_rgba(36,107,255,0.3)]',
    ghost:
      'border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700',
    soft:
      'border border-brand-100 bg-brand-50 text-brand-700 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white',
    danger:
      'border border-transparent bg-red-500 text-white shadow-[0_10px_18px_rgba(239,68,68,0.24)] hover:-translate-y-0.5 hover:bg-red-600'
  };

  return (
    <button
      className={classNames(
        'min-h-[44px] rounded-[1rem] px-4 py-2.5 text-[14px] font-semibold tracking-[0.01em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
