export default function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`ui-surface ui-soft-hover ui-card-enter rounded-2xl p-5 lg:p-6 ${className}`}>
      {(title || subtitle) && (
        <header className="mb-4">
          {subtitle && <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{subtitle}</p>}
          {title && <h3 className="mt-1 text-xl font-bold text-slate-900">{title}</h3>}
        </header>
      )}
      {children}
    </section>
  );
}
