export default function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`ui-surface ui-soft-hover ui-card-enter rounded-[1.75rem] p-5 lg:p-6 ${className}`}>
      {(title || subtitle) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {subtitle && <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{subtitle}</p>}
            {title && <h3 className="mt-1 text-xl font-bold text-slate-900">{title}</h3>}
          </div>
          {actions ? <div>{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
