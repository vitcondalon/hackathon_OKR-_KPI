"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiRequest, ApiError } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Summary = {
  total_users: number;
  total_departments: number;
  total_objectives: number;
  total_key_results: number;
  total_checkins: number;
  average_objective_progress: number;
};

type Progress = {
  average_objective_progress: number;
  objective_counts_by_status: Array<{ status: string; count: number }>;
};

type Risk = { risk_level: string; count: number };
type Performer = { user_id: number; full_name: string; average_progress: number; objective_count: number };
type Chart = { label: string; objectives: number; average_progress: number };

const DEFAULT_SUMMARY: Summary = {
  total_users: 0,
  total_departments: 0,
  total_objectives: 0,
  total_key_results: 0,
  total_checkins: 0,
  average_objective_progress: 0,
};

const DEFAULT_PROGRESS: Progress = {
  average_objective_progress: 0,
  objective_counts_by_status: [],
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSummary(value: unknown): value is Summary {
  return (
    isObject(value) &&
    typeof value.total_users === "number" &&
    typeof value.total_departments === "number" &&
    typeof value.total_objectives === "number" &&
    typeof value.total_key_results === "number" &&
    typeof value.total_checkins === "number" &&
    typeof value.average_objective_progress === "number"
  );
}

function isProgress(value: unknown): value is Progress {
  return (
    isObject(value) &&
    typeof value.average_objective_progress === "number" &&
    Array.isArray(value.objective_counts_by_status)
  );
}

function isRiskList(value: unknown): value is Risk[] {
  return (
    Array.isArray(value) &&
    value.every((item) => isObject(item) && typeof item.risk_level === "string" && typeof item.count === "number")
  );
}

function isPerformerList(value: unknown): value is Performer[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isObject(item) &&
        typeof item.user_id === "number" &&
        typeof item.full_name === "string" &&
        typeof item.average_progress === "number" &&
        typeof item.objective_count === "number"
    )
  );
}

function isChartList(value: unknown): value is Chart[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isObject(item) &&
        typeof item.label === "string" &&
        typeof item.objectives === "number" &&
        typeof item.average_progress === "number"
    )
  );
}

export function DashboardOverview() {
  const [summary, setSummary] = useState<Summary>(DEFAULT_SUMMARY);
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [summaryResult, progressResult, riskResult, performerResult, chartResult] =
          await Promise.allSettled([
          apiRequest<Summary>("/dashboard/summary"),
          apiRequest<Progress>("/dashboard/progress"),
          apiRequest<Risk[]>("/dashboard/risks"),
          apiRequest<Performer[]>("/dashboard/top-performers"),
          apiRequest<Chart[]>("/dashboard/charts"),
        ]);

        const nextSummary =
          summaryResult.status === "fulfilled" && isSummary(summaryResult.value)
            ? summaryResult.value
            : DEFAULT_SUMMARY;
        const nextProgress =
          progressResult.status === "fulfilled" && isProgress(progressResult.value)
            ? progressResult.value
            : DEFAULT_PROGRESS;

        setSummary(nextSummary);
        setProgress(nextProgress);
        setRisks(riskResult.status === "fulfilled" && isRiskList(riskResult.value) ? riskResult.value : []);
        setPerformers(
          performerResult.status === "fulfilled" && isPerformerList(performerResult.value)
            ? performerResult.value
            : []
        );
        setCharts(chartResult.status === "fulfilled" && isChartList(chartResult.value) ? chartResult.value : []);

        const criticalFailure =
          summaryResult.status === "rejected" ||
          progressResult.status === "rejected" ||
          !isSummary(nextSummary) ||
          !isProgress(nextProgress);

        if (criticalFailure) {
          setError("Dashboard data is temporarily unavailable.");
        }
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Unable to load dashboard";
        setError(message || "Dashboard data is temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="rounded-[28px] bg-white p-6 text-sm text-slate-500 shadow-panel">Loading dashboard...</div>;
  }

  const cards = [
    ["Users", summary.total_users],
    ["Departments", summary.total_departments],
    ["Objectives", summary.total_objectives],
    ["Key Results", summary.total_key_results],
    ["Check-ins", summary.total_checkins],
    ["Avg Progress", `${summary.average_objective_progress}%`],
  ];

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-panel">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="rounded-[24px] bg-white p-5 shadow-panel">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-panel">
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500">Objectives by cycle</p>
            <h3 className="text-xl font-semibold text-slate-950">Progress chart</h3>
          </div>
          <div className="h-80">
            {charts.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
                No data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <Tooltip />
                  <Bar dataKey="average_progress" fill="#2f79ff" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-panel">
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500">Status distribution</p>
            <h3 className="text-xl font-semibold text-slate-950">Objective mix</h3>
          </div>
          <div className="h-80">
            {progress.objective_counts_by_status.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
                No data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progress.objective_counts_by_status}
                    dataKey="count"
                    nameKey="status"
                    outerRadius={110}
                    fill="#2f79ff"
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] bg-white p-6 shadow-panel">
          <h3 className="text-xl font-semibold text-slate-950">Risk groups</h3>
          <div className="mt-4 space-y-3">
            {risks.length === 0 ? (
              <p className="text-sm text-slate-500">No data available yet.</p>
            ) : (
              risks.map((item) => (
                <div key={item.risk_level} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="capitalize text-slate-600">{item.risk_level}</span>
                  <span className="text-lg font-semibold text-slate-950">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-panel">
          <h3 className="text-xl font-semibold text-slate-950">Top performers</h3>
          <div className="mt-4 space-y-3">
            {performers.length === 0 ? (
              <p className="text-sm text-slate-500">Add objectives to surface top performers.</p>
            ) : (
              performers.map((item) => (
                <div key={item.user_id} className="rounded-2xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{item.full_name}</span>
                    <span className="text-brand-700">{item.average_progress}%</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{item.objective_count} objectives</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
