import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import { EmptyChartState } from '../components/charts/EmptyChartState';
import { dashboardApi } from '../api/dashboardApi';
import { funnyApi } from '../api/funnyApi';
import { useAuth } from '../contexts/AuthContext';
import { percent } from '../utils/format';

const COLORS = ['#246bff', '#16a34a', '#f59e0b', '#ef4444', '#0ea5e9', '#7c3aed'];

function summaryCards(summary, role) {
  if (role === 'employee') {
    return [
      { label: 'My objectives', value: summary.total_objectives ?? 0, note: 'Goals assigned to you' },
      { label: 'My KPIs', value: summary.total_kpis ?? 0, note: 'Metrics in your scope' },
      { label: 'Active cycles', value: summary.active_cycles ?? 0, note: 'Current planning windows' },
      { label: 'Progress average', value: percent(summary.objective_avg_progress ?? summary.average_progress ?? 0), note: 'Overall objective progress' }
    ];
  }

  return [
    { label: 'Total users', value: summary.total_users ?? 0, note: 'People in workspace' },
    { label: 'Departments', value: summary.total_departments ?? 0, note: 'Business units tracked' },
    { label: 'Active cycles', value: summary.active_cycles ?? 0, note: 'Current planning windows' },
    { label: 'Objective average', value: percent(summary.objective_avg_progress ?? summary.average_progress ?? 0), note: 'Overall objective progress' }
  ];
}

function riskTone(kind) {
  if (kind === 'critical') return 'border-red-200 bg-red-50 text-red-700';
  if (kind === 'warning') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-sky-200 bg-sky-50 text-sky-700';
}

function toTodoCards(role, summaryData, suggestionData) {
  const suggestions = suggestionData?.suggestions || [];
  if (suggestions.length > 0) {
    return suggestions.slice(0, 4).map((text, index) => ({
      id: `suggestion-${index}`,
      title: text,
      route: '/funny',
      kind: index === 0 ? 'critical' : 'info'
    }));
  }

  if (role === 'admin') {
    return [
      { id: 'admin-1', title: 'Review team risks and risky KPIs before the next checkpoint.', route: '/funny', kind: 'critical' },
      { id: 'admin-2', title: 'Open the assistant summary and highlight top performers for the demo.', route: '/funny', kind: 'info' }
    ];
  }

  if (role === 'manager') {
    return [
      { id: 'manager-1', title: 'Follow up on low progress objectives and overdue check-ins.', route: '/checkins', kind: 'warning' },
      { id: 'manager-2', title: 'Use Funny recommendations to guide your next team review.', route: '/funny', kind: 'info' }
    ];
  }

  return [
    { id: 'employee-1', title: 'Submit a check-in and update your latest KPI progress.', route: '/checkins', kind: 'warning' },
    { id: 'employee-2', title: 'Ask Funny to explain where you are at risk.', route: '/funny', kind: 'info' }
  ];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [progress, setProgress] = useState({ objective_status: [], key_result_status: [], kpi_status: [] });
  const [risks, setRisks] = useState({ key_results: [], kpis: [] });
  const [top, setTop] = useState({ users: [], departments: [] });
  const [charts, setCharts] = useState({
    objective_by_cycle: [],
    kpi_distribution: [],
    department_performance: [],
    checkin_trend: []
  });
  const [funnySummary, setFunnySummary] = useState(null);
  const [funnySuggestions, setFunnySuggestions] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [s, p, r, t, c, fs, fsum] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.progress(),
          dashboardApi.risks(),
          dashboardApi.topPerformers(),
          dashboardApi.charts(),
          funnyApi.suggestions().catch(() => null),
          funnyApi.summary().catch(() => null)
        ]);

        setSummary(s || {});
        setProgress(p || { objective_status: [], key_result_status: [], kpi_status: [] });
        setRisks(r || { key_results: [], kpis: [] });
        setTop(t || { users: [], departments: [] });
        setCharts(c || { objective_by_cycle: [], kpi_distribution: [], department_performance: [], checkin_trend: [] });
        setFunnySuggestions(fs);
        setFunnySummary(fsum?.summary || null);
      } catch {
        setError('Cannot load dashboard data');
      }
    }

    load();
  }, []);

  const cards = useMemo(() => summaryCards(summary, user?.role || 'employee'), [summary, user?.role]);
  const objectiveCycleData = charts.objective_by_cycle || [];
  const kpiDistributionData = (charts.kpi_distribution || []).map((item, idx) => ({
    ...item,
    label: `${item.scope_type || 'unknown'} - ${item.status || 'n/a'}`,
    color: COLORS[idx % COLORS.length]
  }));
  const departmentPerformance = charts.department_performance || [];
  const riskItems = [...(risks.key_results || []), ...(risks.kpis || [])].slice(0, 6);
  const todoCards = toTodoCards(user?.role || 'employee', funnySummary, funnySuggestions);
  const recommendedQuestions = funnySuggestions?.recommendedQuestions || [];

  return (
    <AppLayout title="Dashboard" description="A cleaner role-based cockpit for progress, risk, team performance, and next steps.">
      <div className="space-y-5 ui-page-enter">
        {error ? <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        <Card className="overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="ui-highlight rounded-[1.8rem] p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-700">{user?.role || 'employee'} workspace</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">See what matters first, then act fast.</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">This dashboard blends live OKR/KPI data, risks, and assistant context so each role lands on the right starting point without extra clicks.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/funny" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  Open Funny workspace
                </Link>
                <Link to="/checkins" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  Go to check-ins
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {cards.map((item) => (
                <div key={item.label} className="rounded-[1.4rem] border border-slate-200 bg-white/95 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5">
            <section className="grid gap-5 xl:grid-cols-2">
              <Card title="Objective progress by cycle" subtitle="Trend and delivery movement">
                <div className="h-80">
                  {objectiveCycleData.length === 0 ? (
                    <EmptyChartState label="No objective cycle data" />
                  ) : (
                    <ResponsiveContainer>
                      <BarChart data={objectiveCycleData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avg_key_result_progress" fill="#246bff" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              <Card title="KPI distribution" subtitle="Scope and status mix">
                <div className="h-80">
                  {kpiDistributionData.length === 0 ? (
                    <EmptyChartState label="No KPI distribution" />
                  ) : (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={kpiDistributionData} dataKey="count" nameKey="label" outerRadius={104}>
                          {kpiDistributionData.map((entry) => (
                            <Cell key={entry.label} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <Card title="Risk and alerts" subtitle="What needs attention now">
                <div className="space-y-3">
                  {riskItems.length === 0 ? <p className="text-sm text-slate-500">No risk items right now.</p> : null}
                  {riskItems.map((item) => (
                    <div key={`${item.item_type}-${item.key_result_id || item.kpi_metric_id}`} className="rounded-[1.35rem] border border-red-200 bg-red-50/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.key_result_title || item.kpi_name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-red-700">{item.item_type || 'risk signal'}</p>
                        </div>
                        <span className="status-badge border-red-200 bg-white text-red-700">{percent(item.progress_percent || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="What should I do next?" subtitle="Recommended follow-up actions">
                <div className="space-y-3">
                  {todoCards.map((item) => (
                    <Link key={item.id} to={item.route} className="ui-soft-hover block rounded-[1.35rem] border border-slate-200 bg-white/95 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold leading-relaxed text-slate-900">{item.title}</p>
                        <span className={`status-badge ${riskTone(item.kind)}`}>{item.kind}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </section>

            <Card title="Department performance" subtitle="Cross-department comparison">
              <div className="h-80">
                {departmentPerformance.length === 0 ? (
                  <EmptyChartState label="No department performance data" />
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={departmentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avg_objective_progress" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="Funny summary" subtitle="Role-aware assistant snapshot">
              {funnySummary ? (
                <div className="space-y-4">
                  {funnySummary.narrative ? (
                    <div className="rounded-[1.4rem] border border-brand-100 bg-brand-50/80 p-4 text-sm leading-relaxed text-slate-700">
                      {funnySummary.narrative}
                    </div>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Active cycles</p>
                      <p className="mt-2 text-2xl font-extrabold text-slate-900">{funnySummary.active_cycles?.total ?? 0}</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Pending check-ins</p>
                      <p className="mt-2 text-2xl font-extrabold text-amber-600">{funnySummary.risk_snapshot?.pending_checkins ?? 0}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Funny summary is not available yet.</p>
              )}
            </Card>

            <Card title="Recommended questions" subtitle="Good starting points for the demo">
              <div className="space-y-3">
                {recommendedQuestions.length === 0 ? <p className="text-sm text-slate-500">No assistant recommendations yet.</p> : null}
                {recommendedQuestions.slice(0, 5).map((item) => (
                  <Link key={item.id} to="/funny" className="ui-soft-hover block rounded-[1.35rem] border border-slate-200 bg-white/95 p-4">
                    <p className="text-sm font-semibold text-slate-900">{item.text}</p>
                    {item.reason ? <p className="mt-1 text-xs text-slate-500">{item.reason}</p> : null}
                  </Link>
                ))}
              </div>
            </Card>

            <Card title="Top performers" subtitle="People and departments worth highlighting">
              <div className="space-y-3">
                {(top.users || []).slice(0, 4).map((item) => (
                  <div key={`user-${item.id}`} className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.full_name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.objective_count} objectives and {item.kpi_count} KPIs</p>
                      </div>
                      <span className="text-sm font-bold text-brand-600">{percent(item.objective_avg_progress || 0)}</span>
                    </div>
                  </div>
                ))}

                {(top.departments || []).slice(0, 3).map((item) => (
                  <div key={`department-${item.department_id}`} className="rounded-[1.35rem] border border-slate-200 bg-slate-50/90 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.department_name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.active_member_count} active members</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{percent(item.avg_objective_progress || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Status breakdown" subtitle="Objectives, key results, and KPI status">
              <div className="space-y-4">
                {[
                  ['Objectives', progress.objective_status || []],
                  ['Key Results', progress.key_result_status || []],
                  ['KPIs', progress.kpi_status || []]
                ].map(([group, rows]) => (
                  <div key={group}>
                    <p className="text-sm font-semibold text-slate-900">{group}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rows.length === 0 ? <span className="text-sm text-slate-500">No data</span> : null}
                      {rows.map((row) => (
                        <span key={`${group}-${row.status}`} className="status-badge border-slate-200 bg-slate-50 text-slate-700">
                          {row.status}: {row.count}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
