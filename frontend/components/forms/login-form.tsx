"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, login } from "@/lib/api";
import { setToken } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);
      setToken(result.access_token);
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Unable to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] bg-white p-8 shadow-panel">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Secure Access</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Sign in to the dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Use the seeded admin account first, then create more users from the management pages.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
