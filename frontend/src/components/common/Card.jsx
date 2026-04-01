export default function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`ui-surface ui-soft-hover ui-card-enter rounded-[1.75rem] p-5 lg:p-6 ${className}`}>
      {(title || subtitle) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {subtitle && <p className="ui-card-subtitle">{subtitle}</p>}
            {title && <h3 className="ui-card-title mt-1.5">{title}</h3>}
          </div>
          {actions ? <div>{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
