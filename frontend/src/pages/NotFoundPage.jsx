import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="ui-shell flex items-center justify-center">
      <div className="ui-surface ui-page-enter max-w-lg rounded-3xl p-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-700">404</p>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">The page you requested does not exist or has been moved.</p>
        <Link
          to="/dashboard"
          className="ui-soft-hover mt-5 inline-block rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(36,107,255,0.3)] hover:bg-brand-600"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
