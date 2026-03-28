import { LoginForm } from "@/components/forms/login-form";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function LoginPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] bg-slate-950 p-8 text-white shadow-panel lg:p-12">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-100">OKR / KPI Suite</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight">
              One place to manage departments, people, objectives, results, and check-ins.
            </h1>
            <p className="mt-4 max-w-lg text-sm text-slate-300">
              Built for a clean hackathon demo: straightforward JWT login, practical CRUD flows,
              and dashboard metrics that are easy to explain on stage.
            </p>
          </section>
          <LoginForm />
        </div>
      </div>
    </AuthGuard>
  );
}
