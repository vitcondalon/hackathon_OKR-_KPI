import { useEffect, useMemo, useState } from 'react';
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
import { percent } from '../utils/format';

const COLORS = ['#246bff', '#16a34a', '#f59e0b', '#ef4444', '#0ea5e9', '#7c3aed'];

function statCards(summary) {
  return [
    { label: 'Total Users', value: summary.total_users ?? 0 },
    { label: 'Departments', value: summary.total_departments ?? 0 },
    { label: 'Active Cycles', value: summary.active_cycles ?? 0 },
    { label: 'Objectives', value: summary.total_objectives ?? 0 },
    { label: 'Key Results', value: summary.total_key_results ?? 0 },
    { label: 'KPIs', value: summary.total_kpis ?? 0 },
    { label: 'Objective Avg', value: percent(summary.objective_avg_progress ?? summary.average_progress ?? 0) },
    { label: 'KPI Avg', value: percent(summary.kpi_avg_progress ?? 0) }
  ];
}

export default function DashboardPage() {
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
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [s, p, r, t, c] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.progress(),
          dashboardApi.risks(),
          dashboardApi.topPerformers(),
          dashboardApi.charts()
        ]);

        setSummary(s || {});
        setProgress(p || { objective_status: [], key_result_status: [], kpi_status: [] });
        setRisks(r || { key_results: [], kpis: [] });
        setTop(t || { users: [], departments: [] });
        setCharts(c || { objective_by_cycle: [], kpi_distribution: [], department_performance: [], checkin_trend: [] });
      } catch {
        setError('Cannot load dashboard data');
      }
    }

    load();
  }, []);

  const cards = useMemo(() => statCards(summary), [summary]);

  const objectiveCycleData = charts.objective_by_cycle || [];
  const kpiDistributionData = (charts.kpi_distribution || []).map((item, idx) => ({
    ...item,
    label: `${item.scope_type || 'unknown'} - ${item.status || 'n/a'}`,
    color: COLORS[idx % COLORS.length]
  }));
  const departmentPerformance = charts.department_performance || [];
  const riskItems = [...(risks.key_results || []), ...(risks.kpis || [])];

  return (
    <AppLayout title="Dashboard Overview">
      <div className="space-y-5 ui-page-enter">
        {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((item) => (
            <Card key={item.label} className="min-h-[120px]">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">{item.value}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <Card title="Objective Progress by Cycle" subtitle="Performance trend">
            <div className="h-80">
              {objectiveCycleData.length === 0 ? (
                <EmptyChartState label="No objective cycle data" />
              ) : (
                <ResponsiveContainer>
                  <BarChart data={objectiveCycleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg_key_result_progress" fill="#246bff" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card title="KPI Distribution" subtitle="Scope and status mix">
            <div className="h-80">
              {kpiDistributionData.length === 0 ? (
                <EmptyChartState label="No KPI distribution" />
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={kpiDistributionData} dataKey="count" nameKey="label" outerRadius={106}>
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
          <Card title="Risk Monitor" subtitle="Low-progress items that need attention">
            <div className="space-y-2">
              {riskItems.length === 0 ? <p className="text-sm text-slate-500">No risk items</p> : null}
              {riskItems.map((item) => (
                <div key={`${item.item_type}-${item.key_result_id || item.kpi_metric_id}`} className="rounded-xl border border-red-200 bg-red-50/80 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{item.key_result_title || item.kpi_name}</p>
                    <span className="status-badge border-red-200 bg-red-100 text-red-700">{percent(item.progress_percent || 0)}</span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-red-700">
                    {item.item_type || 'risk'}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Top Performers" subtitle="People and departments with strong progress">
            <div className="space-y-2">
              {(top.users || []).slice(0, 5).map((item) => (
                <div key={`u-${item.id}`} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{item.full_name}</p>
                    <p className="font-semibold text-brand-600">{percent(item.objective_avg_progress || 0)}</p>
                  </div>
                  <p className="text-xs text-slate-500">{item.objective_count} objectives - {item.kpi_count} KPIs</p>
                </div>
              ))}

              {(top.departments || []).slice(0, 3).map((item) => (
                <div key={`d-${item.department_id}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{item.department_name}</p>
                    <p className="font-semibold text-emerald-600">{percent(item.avg_objective_progress || 0)}</p>
                  </div>
                  <p className="text-xs text-slate-500">{item.active_member_count} active members</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Card title="Department Performance" subtitle="Cross-department comparison">
            <div className="h-80">
              {departmentPerformance.length === 0 ? (
                <EmptyChartState label="No department performance data" />
              ) : (
                <ResponsiveContainer>
                  <BarChart data={departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg_objective_progress" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card title="Status Breakdown" subtitle="Objectives / Key Results / KPI status">
            <div className="space-y-4">
              {[
                ['Objectives', progress.objective_status || []],
                ['Key Results', progress.key_result_status || []],
                ['KPIs', progress.kpi_status || []]
              ].map(([group, rows]) => (
                <div key={group}>
                  <h4 className="mb-2 text-sm font-bold text-slate-700">{group}</h4>
                  <div className="flex flex-wrap gap-2">
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
        </section>
      </div>
    </AppLayout>
  );
}

